import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Placeholder middleware - Auth0 route protection will be implemented in Phase 2
// For now, all routes are accessible to allow development to continue
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * TODO: Implement proper route protection in Phase 2
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}