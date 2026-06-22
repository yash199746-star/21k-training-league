import { createClient } from '@/lib/supabase-browser'
import { calculatePoints, getWeekStart } from '@/lib/scoring'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateStreak(supabase: any, userId: string) {
  const { data: allActivities } = await supabase
    .from('activities')
    .select('id, date, activity_type, activity_subtype, points')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .order('id',   { ascending: true })

  if (!allActivities || allActivities.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  const uniqueDates: string[] = Array.from(
    new Set<string>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allActivities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((a: any) =>
          a.activity_subtype !== 'challenge_completion_bonus' &&
          !a.activity_subtype?.startsWith('cm_bonus_')
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((a: any) => a.date as string)
    )
  ).sort()

  // Assign streak position to every unique date
  const dateStreakMap: Record<string, number> = {}
  let streakCount = 1
  dateStreakMap[uniqueDates[0]] = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1])
    const curr = new Date(uniqueDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streakCount++
    } else {
      streakCount = 1
    }
    dateStreakMap[uniqueDates[i]] = streakCount
  }

  // Track the first real activity inserted per date — only it gets the streak bonus.
  // allActivities is ordered by (date asc, id asc) so the first occurrence wins.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstRealPerDate: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const activity of allActivities) {
    if (
      activity.activity_subtype === 'challenge_completion_bonus' ||
      activity.activity_subtype?.startsWith('cm_bonus_')
    ) continue
    if (!firstRealPerDate[activity.date]) {
      firstRealPerDate[activity.date] = activity.id
    }
  }

  // Update ALL activity rows with correct streak bonus and total points.
  // Skip challenge_completion_bonus rows — their points are fixed and must not be inflated.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const activity of allActivities) {
    if (
      activity.activity_subtype === 'challenge_completion_bonus' ||
      activity.activity_subtype?.startsWith('cm_bonus_')
    ) continue

    const streakPosition = dateStreakMap[activity.date] || 1
    const isFirstOfDay = firstRealPerDate[activity.date] === activity.id
    const streakBonus = isFirstOfDay ? Math.min(streakPosition, 7) : 0
    const totalPoints = (activity.points || 0) + streakBonus

    await supabase
      .from('activities')
      .update({ streak_bonus: streakBonus, total_points_that_day: totalPoints })
      .eq('id', activity.id)
  }

  // Recalculate weekly_stats total_points and total_km for all weeks
  const { data: weeklyStats } = await supabase
    .from('weekly_stats')
    .select('week_start')
    .eq('user_id', userId)

  if (weeklyStats) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const week of weeklyStats) {
      const weekEnd = new Date(new Date(week.week_start).getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const { data: weekActivities } = await supabase
        .from('activities')
        .select('total_points_that_day, distance_km, activity_type, activity_subtype')
        .eq('user_id', userId)
        .gte('date', week.week_start)
        .lt('date', weekEnd)

      if (weekActivities) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalPoints = weekActivities.reduce((sum: number, a: any) => sum + (a.total_points_that_day || 0), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalKm = weekActivities
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((a: any) => a.activity_type === 'run' && a.activity_subtype !== 'challenge_completion_bonus')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .reduce((sum: number, a: any) => sum + (a.distance_km || 0), 0)

        await supabase
          .from('weekly_stats')
          .update({ total_points: totalPoints, total_km: totalKm })
          .eq('user_id', userId)
          .eq('week_start', week.week_start)
      }
    }
  }

  // Use local date strings to match activity date format (avoids UTC-offset mismatch on IST)
  const today = new Date()
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0')
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.getFullYear() + '-' +
    String(yesterday.getMonth() + 1).padStart(2, '0') + '-' +
    String(yesterday.getDate()).padStart(2, '0')

  const lastDate = uniqueDates[uniqueDates.length - 1]
  const currentStreak = (lastDate === todayStr || lastDate === yesterdayStr)
    ? dateStreakMap[lastDate]
    : 0

  const longestStreak = Math.max(...Object.values(dateStreakMap))

  return { currentStreak, longestStreak, lastActivityDate: lastDate }
}

export async function logActivity({
  userId,
  date,
  activityType,
  distanceKm,
  durationMins,
  activitySubtype,
}: {
  userId: string
  date: string
  activityType: 'run' | 'activity' | 'rest'
  distanceKm?: number
  durationMins?: number
  activitySubtype?: string
}) {
  const supabase = createClient()

  // Base points only — streak bonus applied after recalculation
  const { basePoints } = calculatePoints(activityType, distanceKm, durationMins, 0)

  // Check weekly limits
  const weekStart = getWeekStart(new Date(date))
  const { data: weeklyStats } = await supabase
    .from('weekly_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  // Fetch today's real activities (bonus rows excluded) for rest-day logic
  const { data: todaysRaw } = await supabase
    .from('activities')
    .select('id, activity_type, activity_subtype')
    .eq('user_id', userId)
    .eq('date', date)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todaysReal = (todaysRaw || []).filter((a: any) =>
    a.activity_subtype !== 'challenge_completion_bonus' &&
    !a.activity_subtype?.startsWith('cm_bonus_')
  )

  if (activityType === 'rest') {
    if (todaysReal.length > 0) {
      return { success: false, error: 'Cannot log rest day — you already have an activity today' }
    }
    if ((weeklyStats?.rest_day_used || 0) >= 1) {
      return { success: false, error: 'Rest day already used this week' }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasRestToday = todaysReal.some((a: any) => a.activity_type === 'rest')
    if (hasRestToday) {
      return { success: false, error: 'Cannot log activity — today is marked as a rest day' }
    }
  }

  const isFirstActivityOfDay = todaysReal.length === 0

  // Insert activity with placeholder points — recalculateStreak will correct them
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      date,
      activity_type: activityType,
      distance_km: distanceKm || null,
      duration_mins: durationMins || null,
      activity_subtype: activitySubtype || null,
      points: basePoints,
      streak_bonus: 0,
      total_points_that_day: basePoints,
    })

  if (activityError) return { success: false, error: activityError.message }

  // Update weekly stats usage counts (total_points corrected by recalculateStreak below)
  const { error: weeklyError } = await supabase
    .from('weekly_stats')
    .upsert({
      user_id: userId,
      week_start: weekStart,
      runs_used: activityType === 'run' ? (weeklyStats?.runs_used || 0) + 1 : (weeklyStats?.runs_used || 0),
      activity_days_used: activityType === 'activity' ? (weeklyStats?.activity_days_used || 0) + 1 : (weeklyStats?.activity_days_used || 0),
      rest_day_used: activityType === 'rest' ? 1 : (weeklyStats?.rest_day_used || 0),
      total_points: (weeklyStats?.total_points || 0) + basePoints,
      total_km: activityType === 'run' ? (weeklyStats?.total_km || 0) + (distanceKm || 0) : (weeklyStats?.total_km || 0),
    }, { onConflict: 'user_id,week_start' })

  if (weeklyError) return { success: false, error: weeklyError.message }

  // Recalculate all streaks and points from scratch, updating every affected row
  const { currentStreak, longestStreak, lastActivityDate } = await recalculateStreak(supabase, userId)

  // Streak bonus only applies to the first activity of the day
  const streakBonus = isFirstActivityOfDay ? Math.min(currentStreak, 7) : 0
  const totalPoints = basePoints + streakBonus

  // Upsert streaks table with recalculated values
  await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: lastActivityDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  // Update challenge_progress for the active challenge this week
  const { data: activeChallenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (activeChallenge) {
    // Check previous completion to guard one-time bonus award
    const { data: prevProgress } = await supabase
      .from('challenge_progress')
      .select('is_completed')
      .eq('challenge_id', activeChallenge.id)
      .eq('user_id', userId)
      .maybeSingle()

    const wasCompleted = prevProgress?.is_completed || false

    let progressValue = 0

    if (activeChallenge.challenge_type === 'number_of_runs') {
      const { data: runsRaw } = await supabase
        .from('activities')
        .select('id, activity_subtype')
        .eq('user_id', userId)
        .eq('activity_type', 'run')
        .gte('date', weekStart)
      const realRuns = (runsRaw || []).filter((r: { activity_subtype?: string | null }) =>
        r.activity_subtype !== 'challenge_completion_bonus' &&
        !r.activity_subtype?.startsWith('cm_bonus_')
      )
      progressValue = realRuns.length
    } else if (activeChallenge.challenge_type === 'runs_with_min_distance') {
      const { data: runsRaw } = await supabase
        .from('activities')
        .select('distance_km, activity_subtype')
        .eq('user_id', userId)
        .eq('activity_type', 'run')
        .gte('date', weekStart)
      const realRuns = (runsRaw || []).filter((r: { distance_km?: number | null; activity_subtype?: string | null }) =>
        r.activity_subtype !== 'challenge_completion_bonus' &&
        !r.activity_subtype?.startsWith('cm_bonus_')
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progressValue = realRuns.filter((r: any) =>
        (r.distance_km || 0) >= (activeChallenge.min_distance_per_run || 0)
      ).length
    } else if (activeChallenge.challenge_type === 'total_distance') {
      const { data: runsRaw } = await supabase
        .from('activities')
        .select('distance_km, activity_subtype')
        .eq('user_id', userId)
        .eq('activity_type', 'run')
        .gte('date', weekStart)
      const realRuns = (runsRaw || []).filter((r: { activity_subtype?: string | null }) =>
        r.activity_subtype !== 'challenge_completion_bonus' &&
        !r.activity_subtype?.startsWith('cm_bonus_')
      )
      progressValue = realRuns.reduce((sum: number, r: { distance_km?: number | null }) => sum + (r.distance_km || 0), 0)
    } else if (activeChallenge.challenge_type === 'single_run_distance') {
      const { data: runsRaw } = await supabase
        .from('activities')
        .select('distance_km, activity_subtype')
        .eq('user_id', userId)
        .eq('activity_type', 'run')
        .gte('date', weekStart)
      const realRuns = (runsRaw || []).filter((r: { activity_subtype?: string | null }) =>
        r.activity_subtype !== 'challenge_completion_bonus' &&
        !r.activity_subtype?.startsWith('cm_bonus_')
      )
      progressValue = realRuns.reduce((max: number, r: { distance_km?: number | null }) => Math.max(max, r.distance_km || 0), 0)
    } else if (activeChallenge.challenge_type === 'run_streak') {
      const { data: runStreakRaw } = await supabase
        .from('activities')
        .select('date, distance_km, activity_subtype')
        .eq('user_id', userId)
        .eq('activity_type', 'run')
        .gte('date', weekStart)
      const qualifyingRunDays = new Set(
        (runStreakRaw || [])
          .filter((r: { distance_km?: number | null; activity_subtype?: string | null }) =>
            r.activity_subtype !== 'challenge_completion_bonus' &&
            !r.activity_subtype?.startsWith('cm_bonus_') &&
            (r.distance_km || 0) >= (activeChallenge.min_distance_per_run || 0)
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((r: any) => r.date as string)
      )
      progressValue = qualifyingRunDays.size
    } else if (activeChallenge.challenge_type === 'activity_streak') {
      const { data: streakActsRaw } = await supabase
        .from('activities')
        .select('date, activity_subtype')
        .eq('user_id', userId)
        .gte('date', weekStart)
      const uniqueActiveDays = new Set(
        (streakActsRaw || [])
          .filter((a: { activity_subtype?: string | null }) =>
            a.activity_subtype !== 'challenge_completion_bonus' &&
            !a.activity_subtype?.startsWith('cm_bonus_')
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((a: any) => a.date as string)
      )
      progressValue = uniqueActiveDays.size
    } else if (activeChallenge.challenge_type === 'activity_type') {
      const { data: activitiesRaw } = await supabase
        .from('activities')
        .select('id, activity_subtype')
        .eq('user_id', userId)
        .gte('date', weekStart)
      const realActivities = (activitiesRaw || []).filter((a: { activity_subtype?: string | null }) =>
        a.activity_subtype !== 'challenge_completion_bonus' &&
        !a.activity_subtype?.startsWith('cm_bonus_') &&
        a.activity_subtype === activeChallenge.target_activity_type
      )
      progressValue = realActivities.length
    }

    const isCompleted = progressValue >= activeChallenge.target_value

    // Only write progress while incomplete — preserves the final completed state
    if (!wasCompleted) {
      await supabase
        .from('challenge_progress')
        .upsert({
          challenge_id: activeChallenge.id,
          user_id: userId,
          current_value: progressValue,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'challenge_id,user_id' })
    }

    // Award bonus points only the first time the challenge is completed
    if (isCompleted && !wasCompleted) {
      const bonusPoints = activeChallenge.bonus_points || 10
      await supabase
        .from('activities')
        .insert({
          user_id: userId,
          date: date,
          activity_type: activityType,
          points: bonusPoints,
          streak_bonus: 0,
          total_points_that_day: bonusPoints,
          activity_subtype: 'challenge_completion_bonus',
        })
      // Directly increment weekly_stats since recalculateStreak already ran
      const { data: freshWeekly } = await supabase
        .from('weekly_stats')
        .select('total_points')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle()
      await supabase
        .from('weekly_stats')
        .update({ total_points: (freshWeekly?.total_points || 0) + bonusPoints })
        .eq('user_id', userId)
        .eq('week_start', weekStart)
    }

    // Check if ALL users have now completed the challenge
    if (isCompleted) {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id')

      if (allProfiles && allProfiles.length > 0) {
        const { data: allProgress } = await supabase
          .from('challenge_progress')
          .select('user_id, is_completed')
          .eq('challenge_id', activeChallenge.id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allCompleted = allProfiles.every((profile: any) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allProgress?.some((p: any) => p.user_id === profile.id && p.is_completed === true)
        )

        if (allCompleted) {
          const cmUserId = activeChallenge.created_by

          // Prevent double award using a unique activity_subtype per challenge
          const { data: existingCMBonus } = await supabase
            .from('activities')
            .select('id')
            .eq('user_id', cmUserId)
            .eq('activity_subtype', 'cm_bonus_' + activeChallenge.id)
            .maybeSingle()

          if (!existingCMBonus) {
            await supabase
              .from('activities')
              .insert({
                user_id: cmUserId,
                date: date,
                activity_type: 'run',
                points: 5,
                streak_bonus: 0,
                total_points_that_day: 5,
                activity_subtype: 'cm_bonus_' + activeChallenge.id,
              })

            const { data: cmWeekly } = await supabase
              .from('weekly_stats')
              .select('total_points')
              .eq('user_id', cmUserId)
              .eq('week_start', weekStart)
              .maybeSingle()

            await supabase
              .from('weekly_stats')
              .update({ total_points: (cmWeekly?.total_points || 0) + 5 })
              .eq('user_id', cmUserId)
              .eq('week_start', weekStart)
          }
        }
      }
    }
  }

  return { success: true, points: totalPoints, basePoints, streakBonus, newStreak: currentStreak }
}
