import { createClient } from '@/lib/supabase-browser'
import { calculatePoints, getWeekStart } from '@/lib/scoring'

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

  // Get current streak
  const { data: streakData } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  const currentStreak = streakData?.current_streak || 0

  // ── Step 1: Calculate new streak relative to the ACTIVITY DATE ──────────────
  // Using local-date arithmetic to avoid UTC off-by-one in non-UTC timezones
  const [yr, mo, dy] = date.split('-').map(Number)
  const prevDate = new Date(yr, mo - 1, dy - 1)
  const dayBeforeStr = prevDate.getFullYear() + '-' +
    String(prevDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(prevDate.getDate()).padStart(2, '0')

  const lastActivity = streakData?.last_activity_date
  let newStreak: number

  if (!lastActivity) {
    newStreak = 1
  } else if (lastActivity === date) {
    // Same day re-log — keep streak
    newStreak = currentStreak
  } else if (lastActivity === dayBeforeStr) {
    // Consecutive day — increment
    newStreak = currentStreak + 1
  } else {
    // Gap — reset
    newStreak = 1
  }

  // ── Step 2: Calculate points using NEW streak ────────────────────────────────
  const { basePoints, streakBonus, totalPoints } = calculatePoints(
    activityType,
    distanceKm,
    durationMins,
    newStreak
  )

  // ── Step 3: Check weekly limits ──────────────────────────────────────────────
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

  // ── Step 4: Insert activity with correct points ──────────────────────────────
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
      streak_bonus: streakBonus,
      total_points_that_day: totalPoints,
    })

  if (activityError) return { success: false, error: activityError.message }

  // ── Step 5: Update weekly stats ──────────────────────────────────────────────
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

  // ── Step 6: Update streak row ────────────────────────────────────────────────
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
