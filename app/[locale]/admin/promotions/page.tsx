/**
 * Admin Promotions List Page
 * 
 * DESCRIPTION:
 * Promotions management — list, status indicators, create/edit/delete.
 * 
 * FUNCTIONALITY:
 * - List all promotions with pricing, period, variants count
 * - Active / Scheduled / Inactive status badges
 * - Delete with confirmation
 * - Navigate to create/edit
 * - Desktop table / Mobile cards
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/promotions
 * - DELETE /api/admin/promotions/[id]
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Calendar, Package } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ar } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

const T = {
  ivory:    '#F7F4EF',
  cream:    '#FFFFFF',
  gold:     '#C9A96E',
  espresso: '#1A1714',
  muted:    '#8B7E74',
  dust:     '#F2EDE6',
}

interface Promotion {
  id: string
  name: string
  discountedPrice: number | null
  startDate: string
  endDate: string
  isActive: boolean
  variantCount: number
  createdAt: string
  updatedAt: string
}

export default function AdminPromotionsPage() {
  const router = useRouter()
  const locale = useLocale()
  const tp = useTranslations('admin.promotions')
  const tc = useTranslations('admin.common')
  const isRtl = locale === 'ar'
  const dateLocale = locale === 'ar' ? ar : fr

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchPromotions() }, [])

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promotions')
      const data = await res.json()
      setPromotions(data.promotions || [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(tp('confirmDelete'))) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' })
      if (res.ok) { setPromotions(p => p.filter(x => x.id !== id)); toast.success(isRtl ? 'تم حذف العرض' : 'Promotion supprimée') }
      else toast.error(tc('error'))
    } catch {
      toast.error(tc('error'))
    }
    setDeleting(null)
  }

  const isPromotionActive = (promo: Promotion) => {
    if (!promo.isActive) return false
    const now = new Date()
    return now >= new Date(promo.startDate) && now <= new Date(promo.endDate)
  }

  const statusBadge = (promo: Promotion) => {
    const active = isPromotionActive(promo)
    if (active) return { label: tp('active'), bg: '#DCFCE7', color: '#166534' }
    if (promo.isActive) return { label: locale === 'ar' ? 'مجدول' : 'Planifié', bg: '#FEF3C7', color: '#92400E' }
    return { label: tp('inactive'), bg: '#F3F4F6', color: T.muted }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '3rem' }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso }}>
          {tp('title')}
        </h1>
        <button onClick={() => router.push('/admin/promotions/new')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: T.gold, color: T.espresso, fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}>
          <Plus style={{ width: 16, height: 16 }} />
          {tp('addNew')}
        </button>
      </div>

      {promotions.length === 0 ? (
        <div style={{ backgroundColor: T.cream, padding: '3rem', textAlign: 'center' }}>
          <Calendar style={{ width: 48, height: 48, margin: '0 auto 16px', color: `${T.muted}30` }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300, marginBottom: 16 }}>{tp('noPromotions')}</p>
          <button onClick={() => router.push('/admin/promotions/new')}
            style={{ padding: '12px 24px', backgroundColor: T.gold, color: T.espresso, fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {tp('addNew')}
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.gold}10`, backgroundColor: T.dust }}>
                    {[tp('name'), tp('discount'), tp('startDate'), tc('search'), tp('active')].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                    <th style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{tc('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => {
                    const badge = statusBadge(promo)
                    return (
                      <tr key={promo.id} style={{ borderBottom: `1px solid ${T.gold}08`, transition: 'background-color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.dust }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.espresso }}>{promo.name}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{format(new Date(promo.createdAt), 'dd MMM yyyy', { locale: dateLocale })}</p>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.gold }}>
                          {promo.discountedPrice != null ? `${Number(promo.discountedPrice).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA` : '—'}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.espresso, fontWeight: 400 }}>{format(new Date(promo.startDate), 'dd MMM', { locale: dateLocale })}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>→ {format(new Date(promo.endDate), 'dd MMM yyyy', { locale: dateLocale })}</p>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{promo.variantCount}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '3px 10px', backgroundColor: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right' }}>
                          <div className="flex items-center" style={{ gap: 6, justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
                            <button onClick={() => router.push(`/admin/promotions/${promo.id}/edit`)} style={{ padding: 6, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = T.gold }}
                              onMouseLeave={e => { e.currentTarget.style.color = T.muted }}>
                              <Edit style={{ width: 16, height: 16 }} />
                            </button>
                            <button onClick={() => handleDelete(promo.id)} disabled={deleting === promo.id} style={{ padding: 6, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', opacity: deleting === promo.id ? 0.5 : 0.5, transition: 'opacity 0.2s' }}
                              onMouseEnter={e => { if (deleting !== promo.id) e.currentTarget.style.opacity = '1' }}
                              onMouseLeave={e => { if (deleting !== promo.id) e.currentTarget.style.opacity = '0.5' }}>
                              {deleting === promo.id ? (
                                <div style={{ width: 14, height: 14, border: `2px solid #C0392B`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                              ) : <Trash2 style={{ width: 16, height: 16 }} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {promotions.map((promo) => {
              const badge = statusBadge(promo)
              return (
                <div key={promo.id} style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 14 }}>
                  <div className="flex items-start justify-between" style={{ marginBottom: 8 }}>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.espresso }}>{promo.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.gold }}>
                        {promo.discountedPrice != null ? `${Number(promo.discountedPrice).toLocaleString()} DA` : '—'}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '3px 10px', backgroundColor: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 8 }}>
                    {format(new Date(promo.startDate), 'dd MMM', { locale: dateLocale })} — {format(new Date(promo.endDate), 'dd MMM yyyy', { locale: dateLocale })}
                  </p>
                  <div className="flex" style={{ gap: 8 }}>
                    <button onClick={() => router.push(`/admin/promotions/${promo.id}/edit`)} style={{ flex: 1, padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', backgroundColor: `${T.gold}12`, color: T.gold, border: 'none', cursor: 'pointer' }}>
                      {tp('edit') || tc('edit')}
                    </button>
                    <button onClick={() => handleDelete(promo.id)} disabled={deleting === promo.id} style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', backgroundColor: '#FDF2F2', color: '#C0392B', border: 'none', cursor: 'pointer', opacity: deleting === promo.id ? 0.5 : 1 }}>
                      {deleting === promo.id ? tc('delete') + '...' : tp('delete') || tc('delete')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}