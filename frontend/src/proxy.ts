import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/trades', '/analytics', '/playbooks', '/ai', '/onboarding', '/connections']
// Routes that are only for guests
const guestRoutes = ['/login', '/signup', '/pricing']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // We use cookies for tokens to enable server-side auth checks in middleware
  const token = request.cookies.get('access_token')?.value
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isGuest = guestRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (isProtected && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (isGuest && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

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
