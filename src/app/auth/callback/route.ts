import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=true', request.url))
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    return NextResponse.redirect(new URL('/login?error=true', request.url))
  }

  const user = session.user
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
  const firstName = fullName.split(' ')[0] || user.email?.split('@')[0] || 'User'

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)
  } else {
    await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email, name: firstName, avatar_url: avatarUrl })
  }

  return NextResponse.redirect(new URL('/splash', request.url))
}
