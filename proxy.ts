import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

/**
 * Proxy for:
 * 1. Locale detection and routing (next-intl)
 * 2. Admin route protection
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip locale handling for API routes and static files
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Admin route protection (now locale-prefixed)
  const localePattern = /^\/([a-z]{2}(?:-[A-Z]{2})?)\/admin(?:\/|$)/
  const match = pathname.match(localePattern)
  
  if (match && !pathname.includes('/admin/login')) {
    const locale = match[1]
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      const loginUrl = new URL(`/${locale}/admin/login`, request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Continue to locale middleware for admin routes too
  }

  // Handle internationalization for all routes (including admin)
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
