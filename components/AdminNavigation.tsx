/**
 * Admin Navigation Component
 * 
 * DESCRIPTION:
 * Responsive navigation for admin panel with locale-aware links.
 * Desktop: espresso sidebar with gold accents, locale switch, home link, user info.
 * Mobile: bottom nav bar + slide-in drawer overlay.
 * 
 * FUNCTIONALITY:
 * - Navigation links with locale prefix and active state
 * - Home link to storefront
 * - Locale switch toggle (FR / AR)
 * - User email display and logout
 * - RTL-aware layout
 */

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Tag, 
  Settings, 
  LogOut,
  Menu,
  X,
  Globe,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'

const T = {
  ivory:    '#F7F4EF',
  cream:    '#FFFFFF',
  gold:     '#C9A96E',
  espresso: '#1A1714',
  muted:    '#8B7E74',
  dust:     '#F2EDE6',
  ink:      '#2C2420',
}

interface AdminNavigationProps {
  userEmail: string
}

const locales = ['fr', 'ar'] as const

export default function AdminNavigation({ userEmail }: AdminNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin.nav')
  const isRtl = locale === 'ar'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push(`/${locale}/admin/login`)
  }

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  const otherLocale = locales.find(l => l !== locale) || 'fr'
  const localeLabel = otherLocale === 'ar' ? 'AR' : 'FR'

  const l = (href: string) => `/${locale}${href}`

  const isActive = (href: string) => {
    const full = l(href)
    if (href === '/admin/dashboard') return pathname === full
    return pathname.startsWith(full)
  }

  const navItems = [
    { href: '/admin/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/products', label: t('products'), icon: Package },
    { href: '/admin/brands', label: t('brands'), icon: Tag },
    { href: '/admin/categories', label: t('categories'), icon: Tag },
    { href: '/admin/orders', label: t('orders'), icon: ShoppingBag },
    { href: '/admin/promotions', label: t('promotions'), icon: Tag },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 hidden lg:flex lg:w-64 lg:flex-col"
        style={{ backgroundColor: T.espresso, zIndex: 40 }}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo + Home link */}
          <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: `1px solid ${T.gold}15` }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, color: T.ivory }}>
              {t('logo')}
            </h1>
            <a
              href={`/${locale}`}
              style={{ color: `${T.ivory}60`, transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.color = T.gold }}
              onMouseLeave={e => { e.currentTarget.style.color = `${T.ivory}60` }}
              aria-label="Home"
            >
              <ExternalLink style={{ width: 16, height: 16 }} />
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={l(item.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: active ? 500 : 300,
                    color: active ? T.espresso : `${T.ivory}CC`,
                    backgroundColor: active ? T.gold : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!active) { e.currentTarget.style.backgroundColor = `${T.gold}15`; e.currentTarget.style.color = T.ivory }
                  }}
                  onMouseLeave={e => {
                    if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = `${T.ivory}CC` }
                  }}
                >
                  <Icon style={{ width: 18, height: 18, marginInlineEnd: 12 }} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Locale Switch & Logout */}
          <div style={{ padding: 16, borderTop: `1px solid ${T.gold}15` }}>
            {/* Locale Switch */}
            <button
              onClick={() => switchLocale(otherLocale)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '8px 16px',
                marginBottom: 8,
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: `${T.ivory}CC`,
                backgroundColor: `${T.gold}12`,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${T.gold}12`; e.currentTarget.style.color = `${T.ivory}CC` }}
            >
              <Globe style={{ width: 16, height: 16, marginInlineEnd: 10 }} />
              {localeLabel}
            </button>

            <div style={{ marginBottom: 10 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `${T.ivory}60`, marginBottom: 2 }}>
                {t('loggedInAs')}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.ivory, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 300,
                color: `${T.ivory}80`,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${T.gold}10`; e.currentTarget.style.color = '#E57373' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = `${T.ivory}80` }}
            >
              <LogOut style={{ width: 16, height: 16, marginInlineEnd: 10 }} />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div
        className="fixed top-0 left-0 right-0 flex lg:hidden z-40"
        style={{ backgroundColor: T.espresso, height: 56 }}
      >
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center" style={{ gap: 10 }}>
            <a href={`/${locale}`} style={{ color: `${T.ivory}60`, display: 'flex', alignItems: 'center' }}>
              <ExternalLink style={{ width: 16, height: 16 }} />
            </a>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 300, color: T.ivory }}>
              {t('logo')}
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: 8, color: T.ivory, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ backgroundColor: `${T.espresso}80` }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{
                position: 'fixed',
                inset: 0,
                width: 280,
                backgroundColor: T.espresso,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-6" style={{ height: 56, borderBottom: `1px solid ${T.gold}15` }}>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <a href={`/${locale}`} style={{ color: `${T.ivory}60` }}>
                      <ExternalLink style={{ width: 16, height: 16 }} />
                    </a>
                    <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 300, color: T.ivory }}>
                      {t('logo')}
                    </h1>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} style={{ padding: 8, color: T.ivory, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={l(item.href)}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 16px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 13,
                          fontWeight: active ? 500 : 300,
                          color: active ? T.espresso : `${T.ivory}CC`,
                          backgroundColor: active ? T.gold : 'transparent',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = `${T.gold}15`; e.currentTarget.style.color = T.ivory }}}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = `${T.ivory}CC` }}}
                      >
                        <Icon style={{ width: 18, height: 18, marginInlineEnd: 12 }} />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>

                <div style={{ padding: 16, borderTop: `1px solid ${T.gold}15` }}>
                  {/* Locale switch */}
                  <button onClick={() => { setMobileMenuOpen(false); switchLocale(otherLocale) }}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px 16px', marginBottom: 8, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: `${T.ivory}CC`, backgroundColor: `${T.gold}12`, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${T.gold}12`; e.currentTarget.style.color = `${T.ivory}CC` }}>
                    <Globe style={{ width: 16, height: 16, marginInlineEnd: 10 }} />
                    {localeLabel}
                  </button>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: `${T.ivory}60`, marginBottom: 4 }}>
                    {t('loggedIn')}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.ivory, marginBottom: 10 }}>
                    {userEmail}
                  </p>
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 300, color: `${T.ivory}80`, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${T.gold}10`; e.currentTarget.style.color = '#E57373' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = `${T.ivory}80` }}>
                    <LogOut style={{ width: 16, height: 16, marginInlineEnd: 10 }} />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 flex lg:hidden z-30"
        style={{ backgroundColor: T.espresso, borderTop: `1px solid ${T.gold}15` }}
      >
        <nav className="flex justify-around w-full" style={{ padding: '4px 0' }}>
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={l(item.href)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 10px',
                  color: active ? T.gold : `${T.ivory}70`,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                <Icon style={{ width: 18, height: 18, marginBottom: 2 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.2 }}>
                  {item.label.length > 8 ? item.label.substring(0, 6) + '...' : item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}