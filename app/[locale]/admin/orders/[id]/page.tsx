/**
 * Admin Order Detail Page
 * 
 * DESCRIPTION:
 * Detailed view of a single order — items, customer info, status management.
 * 
 * FUNCTIONALITY:
 * - Full order information display
 * - Order items list with product images
 * - Status update dropdown
 * - Customer details (name, phone, address)
 * - Print-friendly receipt layout
 * - Mobile responsive
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/orders/[id] — fetch order with items
 * - PATCH /api/admin/orders/[id] — update order status
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Printer, Phone, MapPin, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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

interface OrderItem {
  id: string
  quantity: number
  unitPrice: string
  productNameFr: string
  variantSize: string
  variant: {
    product: {
      brand: { name: string }
      images: Array<{ url: string }>
    }
  }
}

interface Order {
  id: string
  reference: string
  fullName: string
  phone: string
  wilaya: string
  commune: string
  address: string
  notes: string | null
  total: string
  status: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

const ORDER_STATUSES = [
  { value: 'PENDING',    labelKey: 'pending' },
  { value: 'CONFIRMED',  labelKey: 'confirmed' },
  { value: 'PROCESSING', labelKey: 'processing' },
  { value: 'SHIPPED',    labelKey: 'shipped' },
  { value: 'DELIVERED',  labelKey: 'delivered' },
  { value: 'CANCELLED',  labelKey: 'cancelled' },
]

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const locale = useLocale()
  const tc = useTranslations('admin.common')
  const to = useTranslations('admin.orders')
  const isRtl = locale === 'ar'
  const dateLocale = locale === 'ar' ? ar : fr

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => setOrderId(id))
  }, [params])

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
        } else {
          router.push('/admin/orders')
        }
      } catch {
        router.push('/admin/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId, router])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
      }
    } catch {
      /* ignore */
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#C0392B', backgroundColor: '#FDF2F2', padding: '12px 16px' }}>
        {to('orderDetail')} — {tc('error')}
      </div>
    )
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
      {/* Header */}
      <div className="print:hidden" style={{ marginBottom: 24 }}>
        <Link href="/admin/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, textDecoration: 'none', marginBottom: 16, transition: 'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = T.espresso }}
          onMouseLeave={e => { e.currentTarget.style.color = T.muted }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
          {to('title')}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6rem', fontWeight: 300, color: T.espresso, marginBottom: 4 }}>
              {to('orderDetail')} — {order.reference}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
              {format(new Date(order.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: dateLocale })}
            </p>
          </div>
          <button onClick={handlePrint}
            style={{ marginTop: 12, padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', border: `1px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}>
            <Printer style={{ width: 14, height: 14, marginInlineEnd: 6, display: 'inline', verticalAlign: 'middle' }} />
            {tc('export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>
        {/* Order Items */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.gold}10` }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package style={{ width: 18, height: 18 }} />
                {to('orderItems')}
              </h2>
            </div>
            <div>
              {order.items.map((item, i) => (
                <div key={item.id} className="flex" style={{ padding: '16px 24px', gap: 16, borderBottom: i < order.items.length - 1 ? `1px solid ${T.gold}08` : 'none' }}>
                  {item.variant?.product?.images?.[0] && (
                    <div style={{ width: 64, height: 64, backgroundColor: T.dust, flexShrink: 0, position: 'relative' }}>
                      <Image src={item.variant.product.images[0].url} alt={item.productNameFr} fill className="object-contain" style={{ padding: 6 }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                      {item.variant?.product?.brand?.name || ''}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 400, marginBottom: 2 }}>
                      {item.productNameFr}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
                      {item.variantSize} · {to('quantity')}: {item.quantity}
                    </p>
                  </div>
                  <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
                      {Number(item.unitPrice).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA × {item.quantity}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.espresso }}>
                      {(item.quantity * Number(item.unitPrice)).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.gold}10`, backgroundColor: T.dust }}>
              <div className="flex justify-between items-center">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: T.espresso }}>
                  {to('total')}
                </span>
                <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.3rem', fontWeight: 400, color: T.gold }}>
                  {Number(order.total).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA
                </span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, marginTop: 4, fontWeight: 300 }}>
                {tc('add') === 'Ajouter' ? 'Paiement à la livraison (COD)' : 'الدفع عند الاستلام'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Update */}
          <div className="print:hidden" style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 20 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: T.espresso, marginBottom: 12 }}>
              {to('status')}
            </h3>
            <select
              value={order.status}
              onChange={e => handleStatusUpdate(e.target.value)}
              disabled={updating}
              style={{
                width: '100%', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: 12,
                border: `1.5px solid ${T.espresso}12`, backgroundColor: T.ivory, outline: 'none', cursor: 'pointer', marginBottom: 8, color: T.espresso,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
              onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
            >
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{to(s.labelKey as any)}</option>
              ))}
            </select>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, fontWeight: 300 }}>
              {format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
            </p>
          </div>

          {/* Current Status Badge */}
          <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 20 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '4px 12px', backgroundColor: statusStyle(order.status).bg, color: statusStyle(order.status).color }}>
              {to(order.status.toLowerCase() as any)}
            </span>
          </div>

          {/* Customer Info */}
          <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 20 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: T.espresso, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {to('customerInfo')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 2 }}>{to('customer')}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{order.fullName}</p>
              </div>
              <div className="flex items-start" style={{ gap: 8 }}>
                <Phone style={{ width: 14, height: 14, color: T.muted, marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 2 }}>{to('contact')}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start" style={{ gap: 8 }}>
                <MapPin style={{ width: 14, height: 14, color: T.muted, marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 2 }}>{to('shippingAddress')}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{order.address}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>{order.commune}, {order.wilaya}</p>
                </div>
              </div>
              {order.notes && (
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 2 }}>{to('notes')}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontStyle: 'italic', color: T.espresso, fontWeight: 300 }}>{order.notes}</p>
                </div>
              )}
              {!order.notes && (
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 2 }}>{to('notes')}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: `${T.muted}60`, fontStyle: 'italic', fontWeight: 300 }}>{to('noNotes')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}