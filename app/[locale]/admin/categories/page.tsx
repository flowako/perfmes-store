/**
 * Admin Categories Page
 * 
 * DESCRIPTION:
 * Category management with full CRUD — modal-based create/edit, inline delete with confirmation.
 * 
 * FUNCTIONALITY:
 * - List all categories with product counts
 * - Create category modal (name only, slug auto-generated)
 * - Edit category modal (pre-filled)
 * - Delete with confirmation and error if has products
 * - Desktop table / Mobile cards
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/categories
 * - POST /api/admin/categories
 * - PUT /api/admin/categories/[id]
 * - DELETE /api/admin/categories/[id]
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Package, X } from 'lucide-react'
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
}

interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
  _count?: { products: number }
}

export default function AdminCategoriesPage() {
  const locale = useLocale()
  const tc = useTranslations('admin.categories')
  const tcu = useTranslations('admin.common')
  const isRtl = locale === 'ar'
  const dateLocale = locale === 'ar' ? ar : fr

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => { setEditingCategory(null); setFormData({ name: '' }); setError(''); setShowModal(true) }
  const handleEdit = (cat: Category) => { setEditingCategory(cat); setFormData({ name: cat.name }); setError(''); setShowModal(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setSaving(true)
    setError('')
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) { setShowModal(false); fetchCategories() }
      else { const d = await res.json(); setError(d.error || tcu('error')) }
    } catch {
      setError(tcu('error'))
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(tcu('areYouSure'))) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (res.ok) fetchCategories()
      else { const d = await res.json(); alert(d.error || tcu('error')) }
    } catch {
      alert(tcu('error'))
    }
    setDeleting(null)
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
          {tc('title')}
        </h1>
        <button onClick={handleCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: T.gold, color: T.espresso, fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}>
          <Plus style={{ width: 16, height: 16 }} />
          {tc('addNew')}
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={{ backgroundColor: T.cream, padding: '3rem', textAlign: 'center' }}>
          <Package style={{ width: 48, height: 48, margin: '0 auto 16px', color: `${T.muted}30` }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{tc('noCategories')}</p>
        </div>
      ) : (
        <div className="hidden md:block" style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12` }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.gold}10`, backgroundColor: T.dust }}>
                  {[tc('name'), 'Slug', tc('productsCount')].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                  <th style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{tcu('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: `1px solid ${T.gold}08`, transition: 'background-color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.dust }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.espresso }}>{cat.name}</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>{cat.slug}</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{cat._count?.products || 0}</td>
                    <td style={{ padding: '12px 20px', textAlign: isRtl ? 'left' : 'right' }}>
                      <div className="flex items-center" style={{ gap: 6, justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
                        <button onClick={() => handleEdit(cat)} style={{ padding: 6, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = T.gold }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.muted }}>
                          <Edit style={{ width: 16, height: 16 }} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} style={{ padding: 6, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', opacity: deleting === cat.id ? 0.5 : 0.5, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => { if (deleting !== cat.id) e.currentTarget.style.opacity = '1' }}
                          onMouseLeave={e => { if (deleting !== cat.id) e.currentTarget.style.opacity = '0.5' }}>
                          {deleting === cat.id ? (
                            <div style={{ width: 14, height: 14, border: `2px solid #C0392B`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          ) : <Trash2 style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.map((cat) => (
          <div key={cat.id} style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 14 }}>
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: T.espresso }}>{cat.name}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{cat.slug} · {cat._count?.products || 0} {tc('productsCount')}</p>
            </div>
            <div className="flex" style={{ gap: 8 }}>
              <button onClick={() => handleEdit(cat)} style={{ flex: 1, padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', backgroundColor: `${T.gold}12`, color: T.gold, border: 'none', cursor: 'pointer' }}>
                {tcu('edit')}
              </button>
              <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} style={{ padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', backgroundColor: '#FDF2F2', color: '#C0392B', border: 'none', cursor: 'pointer', opacity: deleting === cat.id ? 0.5 : 1 }}>
                {deleting === cat.id ? tcu('delete') + '...' : tcu('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: `${T.espresso}80`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ backgroundColor: T.cream, maxWidth: 440, width: '100%', padding: 28, position: 'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, [isRtl ? 'left' : 'right']: 16, background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = T.espresso }}
                onMouseLeave={e => { e.currentTarget.style.color = T.muted }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.3rem', fontWeight: 300, color: T.espresso, marginBottom: 20 }}>
                {editingCategory ? tc('edit') : tc('addNew')}
              </h2>
              {error && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#C0392B', backgroundColor: '#FDF2F2', padding: '8px 12px', marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 8, fontWeight: 500 }}>
                    {tc('name')} *
                  </label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ name: e.target.value })}
                    style={{ width: '100%', padding: '11px 16px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                    onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                    onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                    placeholder={isRtl ? 'مثال: شرقي، زهري' : 'e.g., Oriental, Floral'}
                    required autoFocus />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, marginTop: 4, fontWeight: 300 }}>{isRtl ? 'سيتم إنشاء الرابط تلقائياً' : 'Slug will be auto-generated'}</p>
                </div>
                <div className="flex" style={{ gap: 10 }}>
                  <button type="submit" disabled={saving}
                    style={{ flex: 1, padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: T.espresso, color: T.ivory, fontWeight: 500, transition: 'background-color 0.3s', opacity: saving ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = T.gold }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = T.espresso }}>
                    {saving ? tcu('saving') || 'Saving...' : editingCategory ? tcu('save') : tcu('add')}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', border: `1px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}>
                    {tcu('cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}