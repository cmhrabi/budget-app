import type { NextRequest } from 'next/server'
import { auth0 } from './src/lib/auth0'

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request)
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
