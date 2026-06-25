/**
 * Admin Settings Page
 * 
 * DESCRIPTION:
 * Store configuration — bilingual names, contact info, announcement banner.
 * 
 * FUNCTIONALITY:
 * - Store name (FR + AR)
 * - Contact info (phone, email, Instagram)
 * - Announcement banner with bilingual text, toggle, live preview
 * - Inline save feedback
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/settings — load settings
 * - PUT /api/admin/settings — upsert settings
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

const T = {
  ivory:    '#F7F4EF',
  cream:    '#FFFFFF',
  gold:     '#C9A96E',
  espresso: '#1A1714',
  muted:    '#8B7E74',
  dust:     '#F2EDE6',
}

interface Settings {
  storeNameFr: string
  storeNameAr: string
  phone: string
  email: string
  instagramUrl: string
  bannerTextFr: string
  bannerTextAr: string
  bannerEnabled: boolean
}

export default function AdminSettingsPage() {
  const locale = useLocale()
  const ts = useTranslations('admin.settings')
  const tc = useTranslations('admin.common')
  const isRtl = locale === 'ar'

  const [settings, setSettings] = useState<Settings>({
    storeNameFr: '', storeNameAr: '', phone: '', email: '', instagramUrl: '',
    bannerTextFr: '', bannerTextAr: '', bannerEnabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) setMessage({ type: 'success', text: ts('saved') })
      else { const d = await res.json(); setMessage({ type: 'error', text: d.error || tc('error') }) }
    } catch {
      setMessage({ type: 'error', text: tc('error') })
    }
    setSaving(false)
  }

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso, marginBottom: 24 }}>
        {ts('title')}
      </h1>

      <form onSubmit={handleSubmit}>
        {message && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 16px', marginBottom: 20, fontFamily: 'Inter, sans-serif', fontSize: 11, backgroundColor: message.type === 'success' ? '#DCFCE7' : '#FDF2F2', color: message.type === 'success' ? '#166534' : '#C0392B', border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}` }}>
            {message.text}
          </motion.div>
        )}

        {/* Store Info */}
        <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso, marginBottom: 20 }}>
            {ts('general')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {ts('storeName')} (FR)
              </label>
              <input type="text" value={settings.storeNameFr} onChange={e => handleChange('storeNameFr', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                placeholder="Parfums de Luxe" required />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {ts('storeName')} (AR)
              </label>
              <input type="text" value={settings.storeNameAr} onChange={e => handleChange('storeNameAr', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, direction: 'rtl' }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                placeholder="عطور فاخرة" required />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso, marginBottom: 20 }}>
            {ts('shipping') === 'الشحن' ? 'معلومات الاتصال' : 'Coordonnées'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'phone' as const, label: ts('contactPhone'), type: 'tel', placeholder: '+213 555 123 456' },
              { key: 'email' as const, label: ts('contactEmail'), type: 'email', placeholder: 'contact@parfums.dz' },
              { key: 'instagramUrl' as const, label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                  {f.label}
                </label>
                <input type={f.type} value={settings[f.key]} onChange={e => handleChange(f.key, e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                  placeholder={f.placeholder} />
              </div>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 24, marginBottom: 20 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso }}>
              {locale === 'ar' ? 'شريط الإعلان' : "Bannière d'annonce"}
            </h2>
            <label className="flex items-center" style={{ gap: 8, cursor: 'pointer' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted }}>{locale === 'ar' ? 'مفعل' : 'Activé'}</span>
              <div style={{ position: 'relative' }}>
                <input type="checkbox" checked={settings.bannerEnabled} onChange={e => handleChange('bannerEnabled', e.target.checked)} className="sr-only" />
                <div style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: settings.bannerEnabled ? T.gold : `${T.muted}30`, transition: 'background-color 0.2s' }} />
                <div style={{ position: 'absolute', top: 2, left: settings.bannerEnabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', backgroundColor: T.cream, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
              </div>
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {locale === 'ar' ? 'نص الإعلان (فرنسي)' : 'Texte (Français)'}
              </label>
              <textarea value={settings.bannerTextFr} onChange={e => handleChange('bannerTextFr', e.target.value)} rows={2} maxLength={200}
                style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, resize: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                placeholder="Livraison gratuite dès 5000 DA" />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, marginTop: 4, fontWeight: 300, textAlign: isRtl ? 'left' : 'right' }}>
                {settings.bannerTextFr.length}/200
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {locale === 'ar' ? 'نص الإعلان (عربي)' : 'Texte (Arabe)'}
              </label>
              <textarea value={settings.bannerTextAr} onChange={e => handleChange('bannerTextAr', e.target.value)} rows={2} maxLength={200}
                style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, resize: 'none', direction: 'rtl' }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                placeholder="توصيل مجاني للطلبات فوق 5000 دج" />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, marginTop: 4, fontWeight: 300, textAlign: isRtl ? 'right' : 'left' }}>
                {settings.bannerTextAr.length}/200
              </p>
            </div>
          </div>
          {settings.bannerEnabled && (
            <div style={{ marginTop: 16, padding: 14, backgroundColor: `${T.gold}12`, border: `1px solid ${T.gold}20`, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, color: T.muted, marginBottom: 4 }}>
                {locale === 'ar' ? 'معاينة:' : 'Aperçu:'}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 300 }}>
                {isRtl ? (settings.bannerTextAr || '—') : (settings.bannerTextFr || '—')}
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: T.gold, color: T.espresso, fontWeight: 500, transition: 'background-color 0.3s', opacity: saving ? 0.6 : 1 }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}}
            onMouseLeave={e => { if (!saving) { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}}>
            <Save style={{ width: 16, height: 16 }} />
            {saving ? ts('saving') : ts('save')}
          </button>
        </div>
      </form>
    </div>
  )
}