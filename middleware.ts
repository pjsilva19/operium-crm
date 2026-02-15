import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from './lib/supabase/env'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Validate environment variables before creating client
  let supabase
  try {
    const { url, key } = getSupabaseEnv()
    supabase = createServerClient(url, key, {
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
    })
  } catch (error: any) {
    // If env vars are missing or invalid, log error and allow request to continue
    // This prevents the entire site from breaking if env vars are misconfigured
    console.error('Middleware: Supabase configuration error:', error.message)
    // Return response without auth checks - routes will handle auth individually
    // This allows the site to load even if Supabase is misconfigured
    return response
  }

  // If supabase client was not created, skip auth checks
  if (!supabase) {
    return response
  }

  const pathname = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ['/login', '/register', '/track', '/fix-master', '/auto-approve', '/force-approve', '/check-profile', '/bypass-pending']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

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
  } catch (error: any) {
    // If auth check fails, log error but allow request to continue
    // This prevents the entire site from breaking if there's a temporary Supabase issue
    console.error('Middleware: Auth check error:', error.message)
    // Allow request to continue - individual routes will handle auth
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
