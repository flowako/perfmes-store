/**
 * Admin Dashboard Page
 * 
 * DESCRIPTION:
 * Main admin overview page showing key statistics, low stock alerts, and recent orders.
 * 
 * FUNCTIONALITY:
 * - Today/week/month order stats with revenue
 * - Pending orders count (highlighted)
 * - Low stock variants list (≤5 units)
 * - Recent 10 orders with status badges
 * - Auto-refresh every 60 seconds
 * - Navigate to orders/products on click
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/dashboard for aggregated stats
 * - Uses date-fns for date formatting based on locale
 */

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, AlertTriangle, Package, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ar } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'

const T = {
  ivory:    '#F7F4EF',
  cream:    '#FFFFFF',
  gold:     '#C9A96E',
  goldDark: '#A07830',
  espresso: '#1A1714',
  muted:    '#8B7E74',
  dust:     '#F2EDE6',
  ink:      '#2C2420',
}

interface DashboardStats {
  todayOrders: { count: number; total: number }
  weekOrders: { count: number; total: number }
  monthOrders: { count: number; total: number }
  pendingOrdersCount: number
  lowStockVariants: any[]
  recentOrders: any[]
}

export default function AdminDashboardPage() {
  const locale = useLocale()
  const t = useTranslations('admin.dashboard')
  const isRtl = locale === 'ar'

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dateLocale = locale === 'ar' ? ar : fr

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStats(data)
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#C0392B', backgroundColor: '#FDF2F2', padding: '12px 16px' }}>
        {error || t('common.error')}
      </div>
    )
  }

  const statCards = [
    { key: 'today', title: t('today'), count: stats.todayOrders.count, total: stats.todayOrders.total, icon: Calendar },
    { key: 'week', title: t('thisWeek'), count: stats.weekOrders.count, total: stats.weekOrders.total, icon: TrendingUp },
    { key: 'month', title: t('thisMonth'), count: stats.monthOrders.count, total: stats.monthOrders.total, icon: DollarSign },
    { key: 'pending', title: t('pendingOrders'), count: stats.pendingOrdersCount, total: null, icon: ShoppingBag, highlight: stats.pendingOrdersCount > 0 },
  ]

  const statusBg = (status: string) => {
    const map: Record<string, string> = { PENDING: '#FEF3C7', CONFIRMED: '#DBEAFE', PROCESSING: '#FED7AA', SHIPPED: '#CFFAFE', DELIVERED: '#DCFCE7', CANCELLED: '#FEE2E2' }
    return map[status] || '#F3F4F6'
  }
  const statusColor = (status: string) => {
    const map: Record<string, string> = { PENDING: '#92400E', CONFIRMED: '#1E40AF', PROCESSING: '#9A3412', SHIPPED: '#0E7490', DELIVERED: '#166534', CANCELLED: '#991B1B' }
    return map[status] || '#4B5563'
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso, marginBottom: 4 }}>
          {t('title')}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>
          {t('welcome')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 16, marginBottom: 32 }}>
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: T.cream,
                padding: 24,
                border: `1px solid ${card.highlight ? T.gold : `${T.gold}12`}`,
                position: 'relative',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <div style={{ padding: 10, backgroundColor: card.highlight ? '#FEF3C7' : `${T.gold}0D` }}>
                  <Icon style={{ width: 20, height: 20, color: card.highlight ? '#92400E' : T.gold }} />
                </div>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, marginBottom: 4, fontWeight: 300, letterSpacing: '0.05em' }}>
                {card.title}
              </p>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6rem', fontWeight: 400, color: T.espresso, marginBottom: 2 }}>
                {card.count}
              </p>
              {card.total !== null && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
                  {Number(card.total).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 24 }}>
        {/* Low Stock */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}
        >
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.gold}10` }}>
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: T.espresso }}>
                {t('lowStock')}
              </h2>
              <div className="flex items-center gap-1.5" style={{ color: '#92400E' }}>
                <AlertTriangle style={{ width: 16, height: 16 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500 }}>{stats.lowStockVariants.length}</span>
              </div>
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {stats.lowStockVariants.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Package style={{ width: 40, height: 40, margin: '0 auto 8px', color: `${T.muted}40` }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{t('common.noData')}</p>
              </div>
            ) : (
              <div style={{ borderTop: `1px solid ${T.gold}08` }}>
                {stats.lowStockVariants.map((variant: any) => (
                  <Link
                    key={variant.id}
                    href={`/admin/products/${variant.product.slug}/edit`}
                    style={{
                      display: 'block',
                      padding: '14px 24px',
                      textDecoration: 'none',
                      borderBottom: `1px solid ${T.gold}08`,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.dust }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div className="flex items-center justify-between">
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso, marginBottom: 2 }}>
                          {variant.product?.translations?.[0]?.name || '—'}
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>
                          {variant.product?.brand?.name} · {variant.size}
                        </p>
                      </div>
                      <div style={{ padding: '3px 12px', backgroundColor: variant.stock === 0 ? '#FEE2E2' : '#FEF3C7', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, color: variant.stock === 0 ? '#991B1B' : '#92400E', whiteSpace: 'nowrap' }}>
                        {variant.stock} {locale === 'ar' ? 'وحدة' : 'unités'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}
        >
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.gold}10` }}>
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: T.espresso }}>
                {t('recentOrders')}
              </h2>
              <Link href="/admin/orders" style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.gold, letterSpacing: '0.1em', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = T.goldDark }}
                onMouseLeave={e => { e.currentTarget.style.color = T.gold }}>
                {t('viewAll')} →
              </Link>
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {stats.recentOrders.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <ShoppingBag style={{ width: 40, height: 40, margin: '0 auto 8px', color: `${T.muted}40` }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{t('noOrders')}</p>
              </div>
            ) : (
              <div style={{ borderTop: `1px solid ${T.gold}08` }}>
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    style={{
                      display: 'block',
                      padding: '14px 24px',
                      textDecoration: 'none',
                      borderBottom: `1px solid ${T.gold}08`,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.dust }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div className="flex items-start justify-between" style={{ marginBottom: 8 }}>
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{order.fullName}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{order.reference}</p>
                      </div>
                      <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>
                          {Number(order.total).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, fontWeight: 300 }}>
                          {format(new Date(order.createdAt), 'dd MMM HH:mm', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{order.wilaya}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '2px 10px', backgroundColor: statusBg(order.status), color: statusColor(order.status) }}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}