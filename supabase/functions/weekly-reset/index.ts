import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// This function runs at Sunday 6:30 PM UTC = Monday 12:00 AM IST.
// At that moment, UTC date is still Sunday but IST date is already Monday.
// We compute the IST Monday by adding 5h30m to the UTC time.
function getISTMonday(utcDate: Date): string {
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(utcDate.getTime() + istOffset)
  const day = ist.getUTCDay()
  const diff = ist.getUTCDate() - day + (day === 0 ? -6 : 1)
  ist.setUTCDate(diff)
  return ist.getUTCFullYear() + '-' +
    String(ist.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(ist.getUTCDate()).padStart(2, '0')
}

const CM_ORDER = ['Yash', 'Hardik', 'Devansh']
const LEAGUE_START_MS = new Date('2026-05-04T00:00:00+05:30').getTime()

const FALLBACKS = [
  { title: 'The Consistency Run',  description: 'Complete 2 runs this week',                    challenge_type: 'number_of_runs',      target_value: 2,  target_activity_type: null },
  { title: 'Distance Warrior',     description: 'Run a total of 10km this week',                 challenge_type: 'total_distance',      target_value: 10, target_activity_type: null },
  { title: 'The Long One',         description: 'Complete a single run of at least 5km',         challenge_type: 'single_run_distance', target_value: 5,  target_activity_type: null },
  { title: 'Stay Active',          description: 'Maintain a streak of at least 5 days',          challenge_type: 'activity_streak',     target_value: 5,  target_activity_type: null },
  { title: 'Swim Week',            description: 'Complete 2 swim sessions this week',             challenge_type: 'activity_type',       target_value: 2,  target_activity_type: 'Swim' },
]

Deno.serve(async (_req) => {
  try {
    const now = new Date()
    const weekStart = getISTMonday(now)

    // Week number since league start (used for CM rotation and fallback rotation)
    const weekStart_ms = new Date(weekStart + 'T00:00:00+05:30').getTime()
    const weekNum = Math.max(0, Math.floor((weekStart_ms - LEAGUE_START_MS) / (7 * 24 * 60 * 60 * 1000)))

    // 1. Deactivate any currently active challenge
    await supabaseAdmin
      .from('challenges')
      .update({ is_active: false })
      .eq('is_active', true)

    // 2. Look for a challenge the CM already created for this week
    const { data: nextChallenge } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('week_start', weekStart)
      .eq('is_active', false)
      .maybeSingle()

    if (nextChallenge) {
      // CM submitted a challenge — activate it
      await supabaseAdmin
        .from('challenges')
        .update({ is_active: true })
        .eq('id', nextChallenge.id)

      console.log(`Activated CM challenge: ${nextChallenge.title} (week_start: ${weekStart})`)
    } else {
      // No CM challenge found — create and activate a fallback
      const cmName = CM_ORDER[((weekNum % 3) + 3) % 3]
      const fallback = FALLBACKS[weekNum % FALLBACKS.length]

      const { data: cmProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('name', cmName)
        .maybeSingle()

      await supabaseAdmin
        .from('challenges')
        .insert({
          created_by:           cmProfile?.id ?? null,
          week_start:           weekStart,
          title:                fallback.title,
          description:          fallback.description,
          challenge_type:       fallback.challenge_type,
          target_value:         fallback.target_value,
          target_activity_type: fallback.target_activity_type,
          bonus_points:         10,
          is_active:            true,
        })

      console.log(`Created fallback challenge: ${fallback.title} (week_start: ${weekStart}, CM: ${cmName})`)
    }

    return new Response(
      JSON.stringify({ success: true, weekStart, weekNum }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('weekly-reset error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
