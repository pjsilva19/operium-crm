import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware simplificado - sin Supabase
 * 
 * Todas las verificaciones de autenticación se manejan en las páginas individuales
 * usando requireAuth() y requireApprovedUser() de lib/auth.ts
 * 
 * Este middleware solo pasa las requests sin modificarlas.
 */
export async function middleware(request: NextRequest) {
  // Simplemente permitir que todas las requests pasen
  // Las páginas individuales manejarán la autenticación
  return NextResponse.next()
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
