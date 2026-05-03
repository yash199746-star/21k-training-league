import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { confirm } = await request.json()
  if (confirm !== 'RESET') return NextResponse.json({ error: 'Invalid confirmation' }, { status: 400 })

  await supabaseAdmin.from('challenge_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('weekly_stats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabaseAdmin.from('streaks').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ success: true })
}
