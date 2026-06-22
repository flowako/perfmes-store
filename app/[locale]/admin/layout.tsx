/**
 * Admin Layout Component
 * 
 * DESCRIPTION:
 * Wrapper layout for all admin pages. Provides navigation sidebar,
 * and authenticated content area. Parent locale layout provides NextIntlClientProvider.
 * 
 * FUNCTIONALITY:
 * - Accepts locale params for route structure
 * - Checks authentication via NextAuth
 * - Renders AdminNavigation with user email and locale for authenticated users
 * - Provides content area with sidebar offset on desktop (RTL aware)
 * - Login page renders without navigation
 * 
 * BACKEND INTEGRATION:
 * - Uses NextAuth v5 auth() to verify authentication server-side
 * - Uses setRequestLocale() to set locale for server components
 */

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import AdminNavigation from '@/components/AdminNavigation'

const T = {
  ivory: '#F7F4EF',
}

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  
  const isRtl = locale === 'ar'
  const session = await auth()

  // Redirect unauthenticated users to login (skip for login page itself)
  if (!session) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    if (!pathname.endsWith('/login')) {
      redirect(`/${locale}/admin/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }

  if (session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: T.ivory, direction: isRtl ? 'rtl' : 'ltr' }}>
        <AdminNavigation userEmail={session.user?.email || ''} locale={locale} />
        <main 
          className={`min-h-screen ${isRtl ? 'lg:pr-64' : 'lg:pl-64'}`} 
          style={{ 
            paddingTop: '3.5rem', 
            paddingBottom: '5rem',
            transition: 'padding 0.3s ease'
          }}
        > 
          <div style={{ padding: '2rem 1.5rem', maxWidth: 1280, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.ivory, direction: isRtl ? 'rtl' : 'ltr' }}>
      {children}
    </div>
  )
}