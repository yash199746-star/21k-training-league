import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

function getISTDateString(utcDate: Date): string {
  // Add 5 hours 30 minutes for IST
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000))
  return istDate.getUTCFullYear() + '-' +
    String(istDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(istDate.getUTCDate()).padStart(2, '0')
}

function getMondayIST(utcDate: Date): string {
  // Convert to IST first
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000))
  const day = istDate.getUTCDay() // 0=Sun, 1=Mon...
  const diff = istDate.getUTCDate() - day + (day === 0 ? -6 : 1)
  istDate.setUTCDate(diff)
  return istDate.getUTCFullYear() + '-' +
    String(istDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(istDate.getUTCDate()).padStart(2, '0')
}

Deno.serve(async (_req) => {
  try {
    const now = new Date()
    const currentWeekStart = getMondayIST(now)

    console.log('Running weekly reset. UTC time:', now.toISOString())
    console.log('IST date:', getISTDateString(now))
    console.log('Current week start (Monday IST):', currentWeekStart)

    // 1. Deactivate all currently active challenges
    const { error: deactivateError } = await supabaseAdmin
      .from('challenges')
      .update({ is_active: false })
      .eq('is_active', true)

    if (deactivateError) console.error('Deactivate error:', deactivateError)

    // 2. Find this week's challenge (week_start = current Monday)
    const { data: thisWeekChallenge, error: findError } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('week_start', currentWeekStart)
      .eq('is_active', false)
      .maybeSingle()

    console.log('Found challenge for this week:', thisWeekChallenge?.title, 'error:', findError)

    if (thisWeekChallenge) {
      // Activate it
      await supabaseAdmin
        .from('challenges')
        .update({ is_active: true })
        .eq('id', thisWeekChallenge.id)

      console.log('Activated challenge:', thisWeekChallenge.title)
    } else {
      // Create fallback challenge
      const LEAGUE_START = new Date('2026-05-04T00:00:00+05:30')
      const weekNum = Math.max(0, Math.floor((now.getTime() - LEAGUE_START.getTime()) / (7 * 24 * 60 * 60 * 1000)))
      const CM_ORDER = ['Yash', 'Hardik', 'Devansh']
      const cmName = CM_ORDER[weekNum % 3]

      const { data: cmProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('name', cmName)
        .maybeSingle()

      const fallbacks = [
        { title: 'The Consistency Run', description: 'Complete 2 runs this week', challenge_type: 'number_of_runs', target_value: 2 },
        { title: 'Distance Warrior', description: 'Run a total of 10km this week', challenge_type: 'total_distance', target_value: 10 },
        { title: 'The Long One', description: 'Complete a single run of at least 5km', challenge_type: 'single_run_distance', target_value: 5 },
        { title: 'Stay Active', description: 'Maintain a streak of at least 5 days', challenge_type: 'activity_streak', target_value: 5 },
        { title: 'Swim Week', description: 'Complete 2 swim sessions this week', challenge_type: 'activity_type', target_value: 2, target_activity_type: 'Swim' },
      ]

      const fallback = fallbacks[weekNum % fallbacks.length]

      await supabaseAdmin
        .from('challenges')
        .insert({
          created_by: cmProfile?.id,
          week_start: currentWeekStart,
          title: fallback.title,
          description: fallback.description,
          challenge_type: fallback.challenge_type,
          target_value: fallback.target_value,
          target_activity_type: (fallback as any).target_activity_type || null,
          is_active: true
        })

      console.log('Created fallback challenge:', fallback.title)
    }

    return new Response(
      JSON.stringify({ success: true, weekStart: currentWeekStart }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Weekly reset error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
