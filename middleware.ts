import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ['/login', '/register', '/track', '/fix-master', '/auto-approve', '/force-approve', '/check-profile', '/bypass-pending']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, get profile
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved, rol')
      .eq('id', session.user.id)
      .single()

    // If user is master but not approved, auto-approve them
    if (profile?.rol === 'master' && !profile.approved) {
      await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', session.user.id)
    }

    // If authenticated and trying to access login/register
    if (pathname === '/login' || pathname === '/register') {
      // Master users or approved users go to dashboard
      if (profile?.rol === 'master' || profile?.approved) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/pending', request.url))
      }
    }

    // If trying to access /pending but user is master or approved, redirect to dashboard
    if (pathname === '/pending') {
      if (profile?.rol === 'master' || profile?.approved) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // If authenticated, check approval status for protected routes
    if (!isPublicRoute && pathname !== '/pending') {
      // Master users can always access
      if (profile?.rol === 'master') {
        // Allow access
      } else if (!profile?.approved) {
        return NextResponse.redirect(new URL('/pending', request.url))
      }
    }

    // Protect /usuarios route - only master
    if (pathname === '/usuarios' && profile?.rol !== 'master') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
