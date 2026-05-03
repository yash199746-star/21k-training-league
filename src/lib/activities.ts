import { createClient } from '@/lib/supabase-browser'
import { calculatePoints, getWeekStart } from '@/lib/scoring'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateStreak(supabase: any, userId: string) {
  const { data: allActivities } = await supabase
    .from('activities')
    .select('date, activity_type')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (!allActivities || allActivities.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueDates: string[] = Array.from(new Set<string>(allActivities.map((a: any) => a.date as string))).sort()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const lastDate = uniqueDates[uniqueDates.length - 1]

  if (lastDate !== todayStr && lastDate !== yesterdayStr) {
    return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates), lastActivityDate: lastDate }
  }

  let currentStreak = 1
  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const curr = new Date(uniqueDates[i + 1])
    const prev = new Date(uniqueDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      currentStreak++
    } else {
      break
    }
  }

  return { currentStreak, longestStreak: calculateLongestStreak(uniqueDates), lastActivityDate: lastDate }
}

function calculateLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  let longest = 1
  let current = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
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

  // Insert activity with placeholder streak values — corrected below after recalc
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

  // Recalculate streak from scratch based on all activity dates
  const { currentStreak, longestStreak, lastActivityDate } = await recalculateStreak(supabase, userId)

  const streakBonus = Math.min(currentStreak, 7)
  const totalPoints = basePoints + streakBonus

  // Correct the activity row with final streak bonus and total points
  await supabase
    .from('activities')
    .update({
      streak_bonus: streakBonus,
      total_points_that_day: totalPoints,
    })
    .eq('user_id', userId)
    .eq('date', date)

  // Update weekly stats with correct totals
  const { error: weeklyError } = await supabase
    .from('weekly_stats')
    .upsert({
      user_id: userId,
      week_start: weekStart,
      runs_used: activityType === 'run' ? (weeklyStats?.runs_used || 0) + 1 : (weeklyStats?.runs_used || 0),
      activity_days_used: activityType === 'activity' ? (weeklyStats?.activity_days_used || 0) + 1 : (weeklyStats?.activity_days_used || 0),
      rest_day_used: activityType === 'rest' ? 1 : (weeklyStats?.rest_day_used || 0),
      total_points: (weeklyStats?.total_points || 0) + totalPoints,
      total_km: activityType === 'run' ? (weeklyStats?.total_km || 0) + (distanceKm || 0) : (weeklyStats?.total_km || 0),
    }, { onConflict: 'user_id,week_start' })

  if (weeklyError) return { success: false, error: weeklyError.message }

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
