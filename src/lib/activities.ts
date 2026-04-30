import { createClient } from '@/lib/supabase-browser'
import { calculatePoints, getWeekStart } from '@/lib/scoring'

export async function logActivity({
  userId,
  date,
  activityType,
  distanceKm,
  durationMins,
  durationSecs,
  activitySubtype,
}: {
  userId: string
  date: string
  activityType: 'run' | 'activity' | 'rest'
  distanceKm?: number
  durationMins?: number
  durationSecs?: number
  activitySubtype?: string
}) {
  const supabase = createClient()

  // Get current streak
  const { data: streakData } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  const currentStreak = streakData?.current_streak || 0

  // Calculate points
  const { basePoints, streakBonus, totalPoints } = calculatePoints(
    activityType,
    distanceKm,
    durationMins,
    currentStreak
  )

  // Check weekly limits
  const weekStart = getWeekStart(new Date(date))
  const { data: weeklyStats } = await supabase
    .from('weekly_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single()

  // Enforce weekly limits
  if (activityType === 'activity' && (weeklyStats?.activity_days_used || 0) >= 2) {
    return { success: false, error: 'Maximum 2 activity days per week reached' }
  }
  if (activityType === 'rest' && (weeklyStats?.rest_day_used || 0) >= 1) {
    return { success: false, error: 'Rest day already used this week' }
  }

  // Insert activity
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      date,
      activity_type: activityType,
      distance_km: distanceKm || null,
      duration_mins: durationMins || null,
      duration_secs: durationSecs || null,
      activity_subtype: activitySubtype || null,
      points: basePoints,
      streak_bonus: streakBonus,
      total_points_that_day: totalPoints,
    })

  if (activityError) return { success: false, error: activityError.message }

  // Update weekly stats
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

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const lastActivityDate = streakData?.last_activity_date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = 1
  if (lastActivityDate === yesterdayStr || lastActivityDate === today) {
    newStreak = (streakData?.current_streak || 0) + (lastActivityDate === today ? 0 : 1)
  }

  const newLongest = Math.max(newStreak, streakData?.longest_streak || 0)

  await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: date,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  return { success: true, points: totalPoints, basePoints, streakBonus, newStreak }
}
