import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { leagueName, raceDate, seasonStartDate } = await request.json()
  const { error } = await supabaseAdmin.from('league_settings').upsert({
    id:                1,
    league_name:       leagueName,
    race_date:         raceDate,
    season_start_date: seasonStartDate,
    updated_at:        new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
