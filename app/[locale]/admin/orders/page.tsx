/**
 * Admin Orders List Page
 * 
 * DESCRIPTION:
 * Comprehensive order management with filtering, search, pagination, and inline status updates.
 * 
 * FUNCTIONALITY:
 * - Search by reference or customer name
 * - Filter by order status
 * - Paginated table (desktop) / cards (mobile)
 * - Inline status update dropdowns
 * - Navigate to order detail
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/orders?status=X&search=Y&page=1&limit=20
 * - PATCH /api/admin/orders/[id] for inline status updates
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ar } from 'date-fns/locale'
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

interface Order {
  id: string
  reference: string
  fullName: string
  phone: string
  wilaya: string
  total: string
  status: string
  createdAt: string
  items: any[]
}

const ORDER_STATUSES = [
  { value: 'all', labelKey: 'all' },
  { value: 'PENDING', labelKey: 'pending' },
  { value: 'CONFIRMED', labelKey: 'confirmed' },
  { value: 'PROCESSING', labelKey: 'processing' },
  { value: 'SHIPPED', labelKey: 'shipped' },
  { value: 'DELIVERED', labelKey: 'delivered' },
  { value: 'CANCELLED', labelKey: 'cancelled' },
] as const

export default function AdminOrdersPage() {
  const locale = useLocale()
  const tc = useTranslations('admin.common')
  const to = useTranslations('admin.orders')
  const isRtl = locale === 'ar'
  const dateLocale = locale === 'ar' ? ar : fr

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300)
    return () => clearTimeout(t)
  }, [fetchOrders])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchOrders()
    } catch {
      /* ignore */
    } finally {
      setUpdatingStatus(null)
    }
  }

  const statusStyle = (s: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      PENDING:    { bg: '#FEF3C7', color: '#92400E' },
      CONFIRMED:  { bg: '#DBEAFE', color: '#1E40AF' },
      PROCESSING: { bg: '#FED7AA', color: '#9A3412' },
      SHIPPED:    { bg: '#CFFAFE', color: '#0E7490' },
      DELIVERED:  { bg: '#DCFCE7', color: '#166534' },
      CANCELLED:  { bg: '#FEE2E2', color: '#991B1B' },
    }
    return map[s] || { bg: '#F3F4F6', color: '#4B5563' }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso, marginBottom: 4 }}>
          {to('title')}
        </h1>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 16, marginBottom: 20 }}>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <div style={{ gridColumn: 'md/span 2' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', [isRtl ? 'right' : 'left']: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: `${T.muted}80` }} />
              <input
                type="text"
                placeholder={to('searchOrders')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  paddingInlineStart: 40,
                  border: `1.5px solid ${T.espresso}12`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: T.espresso,
                  backgroundColor: T.ivory,
                  outline: 'none',
                  fontWeight: 300,
                  direction: isRtl ? 'rtl' : 'ltr',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: `1.5px solid ${T.espresso}12`,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: T.espresso,
              backgroundColor: T.ivory,
              outline: 'none',
              fontWeight: 300,
              cursor: 'pointer',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
            onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
          >
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.value === 'all' ? to('title') : to(s.labelKey as any)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block" style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '3rem' }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 300 }}>
            {to('noOrders')}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.gold}10`, backgroundColor: T.dust }}>
                    {[to('reference'), to('customer'), to('shippingAddress'), to('total'), to('date'), to('status')].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                    <th style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {to('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: `1px solid ${T.gold}08`, transition: 'background-color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.dust }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <code style={{ fontFamily: 'monospace', fontSize: 12, color: T.espresso, letterSpacing: '0.05em' }}>{order.reference}</code>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{order.fullName}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{order.phone}</p>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{order.wilaya}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>
                        {Number(order.total).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={order.status}
                          onChange={e => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingStatus === order.id}
                          style={{
                            fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500,
                            padding: '4px 10px',
                            backgroundColor: statusStyle(order.status).bg,
                            color: statusStyle(order.status).color,
                            border: 'none', cursor: 'pointer', outline: 'none',
                          }}
                        >
                          {ORDER_STATUSES.filter(s => s.value !== 'all').map(s => (
                            <option key={s.value} value={s.value}>
                              {to(s.labelKey as any)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: isRtl ? 'left' : 'right' }}>
                        <Link href={`/admin/orders/${order.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 11,
                            color: T.gold,
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = T.espresso }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.gold }}>
                          <Eye style={{ width: 16, height: 16 }} />
                          {to('view')}
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: `1px solid ${T.gold}10` }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 11, border: `1px solid ${T.espresso}15`, color: T.espresso, backgroundColor: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, transition: 'background-color 0.2s' }}
                  onMouseEnter={e => { if (page > 1) e.currentTarget.style.backgroundColor = T.dust }}
                  onMouseLeave={e => { if (page > 1) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  <ArrowLeft style={{ width: 14, height: 14, marginInlineEnd: 6, display: 'inline', verticalAlign: 'middle' }} />
                  {tc('previous')}
                </button>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted }}>
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 11, border: `1px solid ${T.espresso}15`, color: T.espresso, backgroundColor: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, transition: 'background-color 0.2s' }}
                  onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = T.dust }}
                  onMouseLeave={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  {tc('next')}
                  <ArrowRight style={{ width: 14, height: 14, marginInlineStart: 6, display: 'inline', verticalAlign: 'middle' }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '3rem' }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 300 }}>
            {to('noOrders')}
          </div>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 16 }}
            >
              <div className="flex items-start justify-between" style={{ marginBottom: 10 }}>
                <div>
                  <code style={{ fontFamily: 'monospace', fontSize: 11, color: T.muted }}>{order.reference}</code>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{order.fullName}</p>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '3px 10px', backgroundColor: statusStyle(order.status).bg, color: statusStyle(order.status).color, whiteSpace: 'nowrap' }}>
                  {to(order.status.toLowerCase() as any)}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginBottom: 12 }}>
                <div className="flex justify-between">
                  <span style={{ fontFamily: 'Inter, sans-serif', color: T.muted, fontWeight: 300 }}>{to('total')}:</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: T.espresso }}>{Number(order.total).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontFamily: 'Inter, sans-serif', color: T.muted, fontWeight: 300 }}>{to('date')}:</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', color: T.espresso, fontWeight: 300 }}>{format(new Date(order.createdAt), 'dd/MM HH:mm', { locale: dateLocale })}</span>
                </div>
              </div>
              <div className="flex" style={{ gap: 8 }}>
                <select
                  value={order.status} onChange={e => handleStatusUpdate(order.id, e.target.value)} disabled={updatingStatus === order.id}
                  style={{
                    flex: 1, padding: '8px 12px', fontFamily: 'Inter, sans-serif', fontSize: 11,
                    border: `1px solid ${T.espresso}12`, backgroundColor: T.ivory, outline: 'none', cursor: 'pointer',
                  }}
                >
                  {ORDER_STATUSES.filter(s => s.value !== 'all').map(s => (
                    <option key={s.value} value={s.value}>{to(s.labelKey as any)}</option>
                  ))}
                </select>
                <Link href={`/admin/orders/${order.id}`}
                  style={{
                    padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 11,
                    backgroundColor: `${T.gold}12`, color: T.gold, textDecoration: 'none', transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${T.gold}25` }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${T.gold}12` }}>
                  {to('view')}
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}