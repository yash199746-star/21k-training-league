export function calculatePoints(
  activityType: 'run' | 'activity' | 'rest',
  distanceKm?: number,
  durationMins?: number,
  currentStreak?: number
): { basePoints: number; streakBonus: number; totalPoints: number; isValid: boolean; reason?: string } {

  let basePoints = 0
  let streakBonus = 0
  let isValid = true
  let reason = ''

  if (activityType === 'run') {
    if (!distanceKm || distanceKm < 2) {
      isValid = false
      reason = 'Minimum 2km required for points'
      return { basePoints: 0, streakBonus: 0, totalPoints: 0, isValid, reason }
    }
    basePoints = Math.round(distanceKm)
  } else if (activityType === 'activity') {
    if (!durationMins || durationMins < 30) {
      isValid = false
      reason = 'Minimum 30 minutes required for points'
      return { basePoints: 0, streakBonus: 0, totalPoints: 0, isValid, reason }
    }
    basePoints = 2
  } else if (activityType === 'rest') {
    basePoints = 0
    isValid = true
  }

  // Streak bonus: day 1 = +1, day 2 = +2 ... day 7+ = +7 (capped)
  if (isValid && currentStreak && currentStreak > 0) {
    streakBonus = Math.min(currentStreak, 7)
  }

  const totalPoints = basePoints + streakBonus

  return { basePoints, streakBonus, totalPoints, isValid, reason }
}

export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}
