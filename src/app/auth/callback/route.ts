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
  const name = user.user_metadata?.full_name || user.user_metadata?.name ||
    user.email?.split('@')[0] || 'User'

  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    name,
    avatar_url: avatarUrl,
  }, { onConflict: 'id' })

  return NextResponse.redirect(new URL('/splash', request.url))
}
