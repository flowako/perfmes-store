import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Proxy for:
 * 1. Admin route protection (now at /:locale/admin/*)
 * 2. Locale detection and routing for storefront (next-intl)
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API and static files — no middleware
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Admin routes — handle protection, then return next()
  const adminMatch = pathname.match(/^\/(fr|ar)\/admin(\/.+)?$/)
  if (adminMatch) {
    const locale = adminMatch[1]
    const adminPath = adminMatch[2] || ''
    
    // Login page — let it render without auth check
    if (adminPath.startsWith('/login')) {
      return NextResponse.next()
    }

    // Protected admin routes
    const token = await getToken({ 
      req: request, 
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const loginUrl = new URL(`/${locale}/admin/login`, request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // Storefront routes — use next-intl middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}