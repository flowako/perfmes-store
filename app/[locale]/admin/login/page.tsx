/**
 * Admin Login Page
 * 
 * DESCRIPTION:
 * Secure login page for admin access. Elegant, minimal design matching the luxury brand.
 * 
 * FUNCTIONALITY:
 * - Email/password form with validation
 * - Uses NextAuth signIn for authentication
 * - Redirects to /admin/dashboard on success
 * - Shows inline error messages (no alerts)
 * - Loading state during authentication
 * 
 * BACKEND INTEGRATION:
 * - POST to NextAuth /api/auth/signin endpoint via signIn()
 * - Uses credentials provider configured in lib/auth.ts
 * - Session stored in HTTP-only cookie
 * 
 * SECURITY:
 * - Generic error messages
 * - Discreet footer note
 * - Backend has 1-second artificial delay
 */

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'

const T = {
  ivory:    '#F7F4EF',
  cream:    '#FFFFFF',
  gold:     '#C9A96E',
  espresso: '#1A1714',
  muted:    '#8B7E74',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations('admin.login')
  const isRtl = locale === 'ar'
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('invalidCredentials'))
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}15`, padding: '40px 36px' }}>
          {/* Logo / Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: T.espresso, marginBottom: 4 }}>
              {t('title')}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
              Maison Éclore · Paris
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#C0392B', backgroundColor: '#FDF2F2', padding: '10px 14px', marginBottom: 20, textAlign: 'center' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="admin@parfums.dz"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1.5px solid ${T.gold}20`,
                  backgroundColor: T.ivory,
                  color: T.espresso,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  direction: isRtl ? 'rtl' : 'ltr',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.gold}20` }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {t('password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1.5px solid ${T.gold}20`,
                    backgroundColor: T.ivory,
                    color: T.espresso,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    direction: isRtl ? 'rtl' : 'ltr',
                    paddingInlineEnd: 44,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${T.gold}20` }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    [isRtl ? 'left' : 'right']: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: T.muted,
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={loading ? undefined : { scale: 0.98 }}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: T.gold,
                color: T.espresso,
                fontWeight: 500,
                transition: 'background-color 0.3s',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = `${T.ivory}` }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}}
            >
              {loading ? t('submitting') : t('submit')}
            </motion.button>
          </form>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, textAlign: 'center', marginTop: 24, fontWeight: 300 }}>
          {t('restrictedAccess')}
        </p>
      </motion.div>
    </div>
  )
}