import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { userId, date, activityType, distanceKm, durationMins, points, reason } = await request.json()
  const { error } = await supabaseAdmin.from('activities').insert({
    user_id:               userId,
    date,
    activity_type:         activityType,
    distance_km:           distanceKm || null,
    duration_mins:         durationMins || null,
    points,
    streak_bonus:          0,
    total_points_that_day: points,
    activity_subtype:      `admin_correction: ${reason}`,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
