import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/trades', '/analytics', '/playbooks', '/ai', '/onboarding']
// Routes that are only for guests
const guestRoutes = ['/login', '/signup']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Note: Since we use client-side state (Zustand + LocalStorage) for tokens, 
  // we can't easily check auth on the server-side middleware without cookies.
  // In a Production app, we would use HttpOnly cookies with NextAuth or similar.
  
  // FOR NOW: We will rely on Client-side redirection in the top-level layout/hooks.
  // HOWEVER, for a robust middleware, we check for a 'auth-token' cookie if it exists.
  
  const token = request.cookies.get('access_token')?.value
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isGuest = guestRoutes.some(route => pathname.startsWith(route))

  // In a real app with cookies:
  /*
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isGuest && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
