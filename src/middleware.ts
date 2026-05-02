import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = pathname === '/login' || pathname.startsWith('/auth/')

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && pathname.startsWith('/admin') && user.email !== 'yash199746@gmail.com') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Show splash unless: arriving from it, or shown within the last 2 hours
  if (user && pathname === '/') {
    const fromSplash = request.nextUrl.searchParams.get('from') === 'splash'
    if (!fromSplash) {
      const splashShown = request.cookies.get('splashShown')?.value
      const twoHoursMs = 2 * 60 * 60 * 1000
      if (splashShown && Date.now() - parseInt(splashShown) < twoHoursMs) {
        return response
      }
      return NextResponse.redirect(new URL('/splash', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
