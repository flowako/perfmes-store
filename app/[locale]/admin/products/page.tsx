/**
 * Admin Products List Page
 * 
 * DESCRIPTION:
 * Product catalog management with search, filtering, and quick actions.
 * 
 * FUNCTIONALITY:
 * - Search products by name
 * - Filter by active/inactive status
 * - Pagination (20 per page)
 * - Soft-delete with confirmation
 * - Quick status indicators (featured, new arrival)
 * - Total stock display with color coding
 * - Create / Edit / Delete actions
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/products?search=X&active=true&page=1&limit=20
 * - DELETE /api/admin/products/[slug] for soft-delete
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
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

interface Product {
  id: string
  slug: string
  brand: { name: string }
  translations: Array<{ locale: string; name: string }>
  images: Array<{ url: string }>
  variants: Array<{ stock: number }>
  isActive: boolean
  isFeatured: boolean
  isNewArrival: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminProductsPage() {
  const locale = useLocale()
  const tp = useTranslations('admin.products')
  const tc = useTranslations('admin.common')
  const isRtl = locale === 'ar'
  const dateLocale = locale === 'ar' ? ar : fr

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.append('search', search)
      if (activeFilter !== 'all') params.append('active', activeFilter)
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [search, activeFilter, page])

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [fetchProducts])

  const handleDelete = (slug: string) => {
    if (!confirm(tc('areYouSure'))) return
    fetch(`/api/admin/products/${slug}`, { method: 'DELETE' })
      .then(r => { if (r.ok) fetchProducts() })
  }

  const getTotalStock = (variants: Array<{ stock: number }>) => variants.reduce((s, v) => s + v.stock, 0)

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso }}>
          {tp('title')}
        </h1>
        <Link href="/admin/products/new"
          style={{
            marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
            backgroundColor: T.gold, color: T.espresso, fontFamily: 'Inter, sans-serif', fontSize: 10,
            letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 500,
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}>
          <Plus style={{ width: 16, height: 16 }} />
          {tp('addNew')}
        </Link>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 16, marginBottom: 20 }}>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <div style={{ gridColumn: 'md/span 2' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', [isRtl ? 'right' : 'left']: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: `${T.muted}80` }} />
              <input type="text" placeholder={tp('search')} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ width: '100%', padding: '10px 16px', paddingInlineStart: 40, border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, direction: isRtl ? 'rtl' : 'ltr' }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }} />
            </div>
          </div>
          <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}
            style={{ width: '100%', padding: '10px 16px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, cursor: 'pointer' }}
            onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
            onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}>
            <option value="all">{tp('title')}</option>
            <option value="true">{tp('active')}</option>
            <option value="false">{tp('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block" style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '3rem' }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 300 }}>
            <Package style={{ width: 40, height: 40, margin: '0 auto 12px', color: `${T.muted}40` }} />
            {tp('noProducts')}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.gold}10`, backgroundColor: T.dust }}>
                    {[tp('name'), tp('name') === 'Nom' ? 'Marque' : 'العلامة', tp('stock'), tc('search'), tp('status')].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                    <th style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {tp('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => {
                    const frName = product.translations.find(t => t.locale === locale)?.name ||
                      product.translations.find(t => t.locale === 'fr')?.name || '—'
                    const totalStock = getTotalStock(product.variants)
                    return (
                      <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        style={{ borderBottom: `1px solid ${T.gold}08`, transition: 'background-color 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.dust }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <div className="flex items-center" style={{ gap: 12 }}>
                            {product.images[0] ? (
                              <div style={{ width: 44, height: 44, backgroundColor: T.dust, position: 'relative', flexShrink: 0 }}>
                                <Image src={product.images[0].url} alt={frName} fill className="object-contain" style={{ padding: 4 }} />
                              </div>
                            ) : (
                              <div style={{ width: 44, height: 44, backgroundColor: T.dust, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package style={{ width: 18, height: 18, color: `${T.muted}60` }} />
                              </div>
                            )}
                            <div>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{frName}</p>
                              <div className="flex" style={{ gap: 4, marginTop: 2 }}>
                                {product.isFeatured && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 500, padding: '1px 6px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}>{tp('isFeatured')}</span>}
                                {product.isNewArrival && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 500, padding: '1px 6px', backgroundColor: '#DBEAFE', color: '#1E40AF' }}>{tp('isNewArrival')}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{product.brand.name}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: totalStock === 0 ? '#C0392B' : totalStock <= 5 ? '#B8860B' : '#2D8B4E' }}>
                            {totalStock}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>
                          {format(new Date(product.createdAt), 'dd MMM yyyy', { locale: dateLocale })}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, padding: '3px 10px', backgroundColor: product.isActive ? '#DCFCE7' : '#F3F4F6', color: product.isActive ? '#166534' : T.muted }}>
                            {product.isActive ? tp('active') : tp('inactive')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right' }}>
                          <div className="flex items-center" style={{ gap: 6, justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
                            <Link href={`/admin/products/${product.slug}/edit`}
                              style={{ padding: 6, color: T.gold, transition: 'color 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = T.espresso }}
                              onMouseLeave={e => { e.currentTarget.style.color = T.gold }}>
                              <Edit style={{ width: 16, height: 16 }} />
                            </Link>
                            <button onClick={() => handleDelete(product.slug)}
                              style={{ padding: 6, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5' }}>
                              <Trash2 style={{ width: 16, height: 16 }} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: `1px solid ${T.gold}10` }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 11, border: `1px solid ${T.espresso}15`, color: T.espresso, backgroundColor: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
                  onMouseEnter={e => { if (page > 1) e.currentTarget.style.backgroundColor = T.dust }}
                  onMouseLeave={e => { if (page > 1) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  {tc('previous')}
                </button>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 11, border: `1px solid ${T.espresso}15`, color: T.espresso, backgroundColor: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
                  onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = T.dust }}
                  onMouseLeave={e => { if (page < totalPages) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  {tc('next')}
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
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 300 }}>
            {tp('noProducts')}
          </div>
        ) : (
          products.map((product, i) => {
            const frName = product.translations.find(t => t.locale === locale)?.name ||
              product.translations.find(t => t.locale === 'fr')?.name || '—'
            const totalStock = getTotalStock(product.variants)
            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 16 }}>
                <div className="flex items-center" style={{ gap: 12, marginBottom: 10 }}>
                  {product.images[0] && (
                    <div style={{ width: 48, height: 48, backgroundColor: T.dust, position: 'relative', flexShrink: 0 }}>
                      <Image src={product.images[0].url} alt={frName} fill className="object-contain" style={{ padding: 4 }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso }}>{frName}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{product.brand.name}</p>
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '3px 10px', backgroundColor: product.isActive ? '#DCFCE7' : '#F3F4F6', color: product.isActive ? '#166534' : T.muted }}>
                    {product.isActive ? tp('active') : tp('inactive')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex" style={{ gap: 4 }}>
                    {product.isFeatured && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, padding: '1px 6px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}>{tp('isFeatured')}</span>}
                    {product.isNewArrival && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, padding: '1px 6px', backgroundColor: '#DBEAFE', color: '#1E40AF' }}>{tp('isNewArrival')}</span>}
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: totalStock === 0 ? '#C0392B' : totalStock <= 5 ? '#B8860B' : '#2D8B4E' }}>
                    {totalStock} {tp('stock')}
                  </span>
                </div>
                <div className="flex" style={{ gap: 8, marginTop: 10 }}>
                  <Link href={`/admin/products/${product.slug}/edit`}
                    style={{ flex: 1, padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', textAlign: 'center', backgroundColor: `${T.gold}12`, color: T.gold, textDecoration: 'none' }}>
                    {tp('edit')}
                  </Link>
                  <button onClick={() => handleDelete(product.slug)}
                    style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', backgroundColor: '#FDF2F2', color: '#C0392B', border: 'none', cursor: 'pointer' }}>
                    {tp('delete')}
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}