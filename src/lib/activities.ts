import { createClient } from '@/lib/supabase-browser'
import { calculatePoints, getWeekStart } from '@/lib/scoring'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateStreak(supabase: any, userId: string) {
  const { data: allActivities } = await supabase
    .from('activities')
    .select('id, date, activity_type, points')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (!allActivities || allActivities.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueDates: string[] = Array.from(new Set<string>(allActivities.map((a: any) => a.date as string))).sort()

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

  // Update ALL activity rows with correct streak bonus and total points
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const activity of allActivities) {
    const streakPosition = dateStreakMap[activity.date] || 1
    const streakBonus = Math.min(streakPosition, 7)
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
        .select('total_points_that_day, distance_km, activity_type')
        .eq('user_id', userId)
        .gte('date', week.week_start)
        .lt('date', weekEnd)

      if (weekActivities) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalPoints = weekActivities.reduce((sum: number, a: any) => sum + (a.total_points_that_day || 0), 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalKm = weekActivities.filter((a: any) => a.activity_type === 'run')
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

  // Determine current streak (only active if last activity was today or yesterday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

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
    .single()

  if (activityType === 'activity' && (weeklyStats?.activity_days_used || 0) >= 2) {
    return { success: false, error: 'Maximum 2 activity days per week reached' }
  }
  if (activityType === 'rest' && (weeklyStats?.rest_day_used || 0) >= 1) {
    return { success: false, error: 'Rest day already used this week' }
  }

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

  const streakBonus = Math.min(currentStreak, 7)
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

  return { success: true, points: totalPoints, basePoints, streakBonus, newStreak: currentStreak }
}
