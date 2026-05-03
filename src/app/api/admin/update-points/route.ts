import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { userId, points } = await request.json()
  const { error } = await supabaseAdmin.from('activities').insert({
    user_id:               userId,
    date:                  new Date().toISOString().split('T')[0],
    activity_type:         'run',
    points,
    streak_bonus:          0,
    total_points_that_day: points,
    activity_subtype:      'admin_points_correction',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
