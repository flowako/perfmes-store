/**
 * Admin Edit Product Page
 * 
 * DESCRIPTION:
 * Edit an existing product — bilingual data, images, variants, categories.
 * Pre-fills form from existing product, updates via PUT.
 * 
 * FUNCTIONALITY:
 * - Fetch and pre-fill existing product data
 * - Update bilingual name + description (FR/AR)
 * - Brand selection with inline creation
 * - Category multi-select with inline creation
 * - Gender, featured, new arrival, active toggles
 * - Image upload via Cloudinary (drag & drop, reorder, max 10)
 * - Variant rows (size, price, stock)
 * - Form validation before submit
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/products/[slug] — fetch existing product
 * - GET /api/admin/brands — brand dropdown
 * - GET /api/admin/categories — category checkboxes
 * - POST /api/upload — Cloudinary image upload
 * - PUT /api/admin/products/[slug] — update product
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, Upload, X, Star, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

const T = {
  ivory: '#F7F4EF', cream: '#FFFFFF', gold: '#C9A96E',
  espresso: '#1A1714', muted: '#8B7E74', dust: '#F2EDE6',
}

interface Brand { id: string; name: string }
interface Category { id: string; name: string }
interface ProductImage { url: string; altFr: string; altAr: string; order: number }
interface FormData {
  nameFr: string; nameAr: string; descriptionFr: string; descriptionAr: string
  brandId: string; gender: 'MEN' | 'WOMEN' | 'UNISEX'
  categoryIds: string[]; isFeatured: boolean; isNewArrival: boolean; isActive: boolean
  variants: Array<{ size: string; price: number; stock: number }>; images: ProductImage[]
}

export default function EditProductPage() {
  const router = useRouter(); const params = useParams(); const productSlug = params.slug as string
  const locale = useLocale(); const tp = useTranslations('admin.products'); const tc = useTranslations('admin.common')
  const isRtl = locale === 'ar'
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false); const [dragActive, setDragActive] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([]); const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showBrandModal, setShowBrandModal] = useState(false); const [brandFormData, setBrandFormData] = useState({ name: '' })
  const [savingBrand, setSavingBrand] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false); const [categoryFormData, setCategoryFormData] = useState({ name: '' })
  const [savingCategory, setSavingCategory] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nameFr: '', nameAr: '', descriptionFr: '', descriptionAr: '',
    brandId: '', gender: 'UNISEX', categoryIds: [],
    isFeatured: false, isNewArrival: false, isActive: true,
    images: [], variants: [],
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${productSlug}`).then(r => r.json()),
      fetch('/api/admin/brands').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([prodData, brandsData, catsData]) => {
      setBrands(brandsData.brands || []); setCategories(catsData.categories || [])
      const p = prodData.product
      if (p) {
        const frT = p.translations.find((t: any) => t.locale === 'fr')
        const arT = p.translations.find((t: any) => t.locale === 'ar')
        setFormData({
          nameFr: frT?.name || '', nameAr: arT?.name || '',
          descriptionFr: frT?.description || '', descriptionAr: arT?.description || '',
          brandId: p.brandId, gender: p.gender,
          categoryIds: p.categories.map((c: any) => c.categoryId),
          isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isActive: p.isActive,
          images: p.images.map((img: any) => ({ url: img.url, altFr: img.altFr || '', altAr: img.altAr || '', order: img.order })),
          variants: p.variants.map((v: any) => ({ size: v.size, price: typeof v.price === 'string' ? parseFloat(v.price) : v.price, stock: v.stock })),
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [productSlug])

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandFormData.name.trim()) return
    setSavingBrand(true)
    try {
      const res = await fetch('/api/admin/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brandFormData) })
      if (res.ok) { const d = await res.json(); const r = await fetch('/api/admin/brands'); setBrands((await r.json()).brands || []); setFormData(p => ({ ...p, brandId: d.brand.id })); setShowBrandModal(false); setBrandFormData({ name: '' }) }
      else { const d = await res.json(); alert(d.error || tc('error')) }
    } catch { alert(tc('error')) }
    setSavingBrand(false)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryFormData.name.trim()) return
    setSavingCategory(true)
    try {
      const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryFormData) })
      if (res.ok) { const d = await res.json(); const r = await fetch('/api/admin/categories'); setCategories((await r.json()).categories || []); setFormData(p => ({ ...p, categoryIds: [...p.categoryIds, d.category.id] })); setShowCategoryModal(false); setCategoryFormData({ name: '' }) }
      else { const d = await res.json(); alert(d.error || tc('error')) }
    } catch { alert(tc('error')) }
    setSavingCategory(false)
  }

  const addVariant = () => setFormData(p => ({ ...p, variants: [...p.variants, { size: '', price: 0, stock: 0 }] }))
  const removeVariant = (i: number) => { if (formData.variants.length > 1) setFormData(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) })) }
  const toggleCategory = (id: string) => setFormData(p => ({ ...p, categoryIds: p.categoryIds.includes(id) ? p.categoryIds.filter(x => x !== id) : [...p.categoryIds, id] }))

  const uploadImage = async (file: File) => {
    if (formData.images.length >= 10 || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setFormData(p => ({ ...p, images: [...p.images, { url: data.url, altFr: p.nameFr || 'Product image', altAr: p.nameAr || 'صورة المنتج', order: p.images.length }] }))
    } catch { /* ignore */ }
    setUploading(false)
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) Array.from(e.target.files).forEach(f => uploadImage(f)); e.target.value = '' }
  const removeImage = (i: number) => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, order: idx })) }))
  const setPrimaryImage = (i: number) => { const imgs = [...formData.images]; const [p] = imgs.splice(i, 1); imgs.unshift({ ...p, order: 0 }); setFormData(fd => ({ ...fd, images: imgs.map((img, idx) => ({ ...img, order: idx })) })) }
  const moveImageUp = (i: number) => { if (i === 0) return; const imgs = [...formData.images]; [imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]]; setFormData(fd => ({ ...fd, images: imgs.map((img, idx) => ({ ...img, order: idx })) })) }
  const moveImageDown = (i: number) => { if (i === formData.images.length - 1) return; const imgs = [...formData.images]; [imgs[i], imgs[i + 1]] = [imgs[i + 1], imgs[i]]; setFormData(fd => ({ ...fd, images: imgs.map((img, idx) => ({ ...img, order: idx })) })) }

  const validateForm = (): boolean => {
    const e: Record<string, string> = {}
    if (!formData.nameFr.trim()) e.nameFr = isRtl ? 'الاسم بالفرنسية مطلوب' : 'French name is required'
    if (!formData.nameAr.trim()) e.nameAr = isRtl ? 'الاسم بالعربية مطلوب' : 'Arabic name is required'
    if (!formData.descriptionFr.trim()) e.descriptionFr = isRtl ? 'الوصف بالفرنسية مطلوب' : 'French description is required'
    if (!formData.descriptionAr.trim()) e.descriptionAr = isRtl ? 'الوصف بالعربية مطلوب' : 'Arabic description is required'
    if (!formData.brandId) e.brandId = isRtl ? 'العلامة التجارية مطلوبة' : 'Brand is required'
    if (formData.categoryIds.length === 0) e.categoryIds = isRtl ? 'اختر فئة واحدة على الأقل' : 'Select at least one category'
    formData.variants.forEach((v, i) => {
      if (!v.size.trim()) e[`variant_${i}_size`] = isRtl ? 'الحجم مطلوب' : 'Size is required'
      if (!v.price || v.price <= 0) e[`variant_${i}_price`] = isRtl ? 'سعر صحيح مطلوب' : 'Valid price required'
      if (v.stock === undefined || v.stock < 0) e[`variant_${i}_stock`] = isRtl ? 'مخزون صحيح مطلوب' : 'Valid stock required'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${productSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          variants: formData.variants.map(v => ({ size: v.size, price: v.price, stock: v.stock })),
        }),
      })
      if (res.ok) router.push('/admin/products')
      else { const d = await res.json(); alert(d.error || tc('error')) }
    } catch { alert(tc('error')) }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, transition: 'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = T.espresso }} onMouseLeave={e => { e.currentTarget.style.color = T.muted }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> {tc('back')}
        </button>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso }}>{tp('editTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
        <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Basic Info */}
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.gold}10` }}>
              {tp('basicInfo')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                {[
                  { key: 'nameFr', label: `${tp('name')} (FR)`, dir: 'ltr' },
                  { key: 'nameAr', label: `${tp('name')} (AR)`, dir: 'rtl' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>{f.label} *</label>
                    <input type="text" value={(formData as any)[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors[f.key] ? '#C0392B' : `${T.espresso}12`}`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, direction: f.dir }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { if (!errors[f.key]) e.currentTarget.style.borderColor = `${T.espresso}12` }} />
                    {errors[f.key] && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors[f.key]}</p>}
                  </div>
                ))}
              </div>
              {[
                { key: 'descriptionFr', label: `${tp('translations')} (FR)`, dir: 'ltr', rows: 4 },
                { key: 'descriptionAr', label: `${tp('translations')} (AR)`, dir: 'rtl', rows: 4 },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>{f.label} *</label>
                  <textarea value={(formData as any)[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} rows={f.rows}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors[f.key] ? '#C0392B' : `${T.espresso}12`}`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, resize: 'none', direction: f.dir }}
                    onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { if (!errors[f.key]) e.currentTarget.style.borderColor = `${T.espresso}12` }} />
                  {errors[f.key] && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors[f.key]}</p>}
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, fontWeight: 500 }}>{isRtl ? 'العلامة التجارية' : 'Marque'} *</span>
                    <button type="button" onClick={() => setShowBrandModal(true)} style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus style={{ width: 12, height: 12 }} /> {tc('add')}
                    </button>
                  </div>
                  <select value={formData.brandId} onChange={e => setFormData(p => ({ ...p, brandId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.brandId ? '#C0392B' : `${T.espresso}12`}`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, cursor: 'pointer' }}>
                    <option value="">{isRtl ? 'اختر العلامة' : 'Select brand'}</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {errors.brandId && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors.brandId}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>{tp('gender')} *</label>
                  <select value={formData.gender} onChange={e => setFormData(p => ({ ...p, gender: e.target.value as any }))}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, cursor: 'pointer' }}>
                    <option value="MEN">{isRtl ? 'رجالي' : 'Homme'}</option>
                    <option value="WOMEN">{isRtl ? 'نسائي' : 'Femme'}</option>
                    <option value="UNISEX">{isRtl ? 'للجنسين' : 'Unisexe'}</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, fontWeight: 500 }}>{isRtl ? 'الفئات' : 'Catégories'} *</span>
                  <button type="button" onClick={() => setShowCategoryModal(true)} style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus style={{ width: 12, height: 12 }} /> {tc('add')}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 8 }}>
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center" style={{ gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} style={{ width: 16, height: 16, accentColor: T.gold }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 300 }}>{c.name}</span>
                    </label>
                  ))}
                </div>
                {errors.categoryIds && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors.categoryIds}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([
                  { key: 'isFeatured', label: tp('isFeatured') },
                  { key: 'isNewArrival', label: tp('isNewArrival') },
                  { key: 'isActive', label: tp('active') },
                ] as const).map(f => (
                  <label key={f.key} className="flex items-center" style={{ gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={(formData as any)[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.checked }))} style={{ width: 16, height: 16, accentColor: T.gold }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 300 }}>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.gold}10` }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso }}>{tp('images')}</h2>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300 }}>{formData.images.length}/10</span>
            </div>
            <div onDragEnter={e => { e.preventDefault(); setDragActive(true) }} onDragLeave={e => { e.preventDefault(); setDragActive(false) }} onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(f => uploadImage(f)) }}
              style={{ padding: 24, border: `2px dashed ${dragActive ? T.gold : `${T.espresso}15`}`, backgroundColor: dragActive ? `${T.gold}06` : 'transparent', textAlign: 'center', marginBottom: 16, cursor: formData.images.length >= 10 ? 'not-allowed' : 'pointer', opacity: formData.images.length >= 10 ? 0.5 : 1 }}>
              <input type="file" id="imgUploadEdit" multiple accept="image/*" onChange={handleFileSelect} disabled={uploading || formData.images.length >= 10} className="sr-only" />
              <label htmlFor="imgUploadEdit" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {uploading ? <div style={{ width: 36, height: 36, border: `3px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : <><Upload style={{ width: 36, height: 36, color: `${T.muted}40` }} /><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{tp('dragDrop')}</p><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: `${T.muted}60`, fontWeight: 300 }}>PNG, JPG, WebP · 5MB max</p></>}
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group" style={{ aspectRatio: '3/4', backgroundColor: T.dust, border: `1px solid ${T.gold}10` }}>
                    {i === 0 && <div style={{ position: 'absolute', top: 6, [isRtl ? 'right' : 'left']: 6, zIndex: 10, backgroundColor: T.gold, color: T.espresso, padding: '1px 8px', fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star style={{ width: 10, height: 10 }} /> {isRtl ? 'رئيسية' : 'Principale'}
                    </div>}
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ gap: 4, opacity: 0, transition: 'opacity 0.2s', backgroundColor: `${T.espresso}60` }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1' }} onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}>
                      <button type="button" onClick={() => moveImageUp(i)} disabled={i === 0} style={{ padding: 6, backgroundColor: T.cream, border: 'none', borderRadius: '50%', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1, color: T.espresso }}><ChevronUp style={{ width: 14, height: 14 }} /></button>
                      {i !== 0 && <button type="button" onClick={() => setPrimaryImage(i)} style={{ padding: 6, backgroundColor: T.cream, border: 'none', borderRadius: '50%', cursor: 'pointer', color: T.gold }}><Star style={{ width: 14, height: 14 }} /></button>}
                      <button type="button" onClick={() => moveImageDown(i)} disabled={i === formData.images.length - 1} style={{ padding: 6, backgroundColor: T.cream, border: 'none', borderRadius: '50%', cursor: 'pointer', opacity: i === formData.images.length - 1 ? 0.3 : 1, color: T.espresso }}><ChevronDown style={{ width: 14, height: 14 }} /></button>
                      <button type="button" onClick={() => removeImage(i)} style={{ padding: 6, backgroundColor: T.cream, border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#C0392B' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.gold}10` }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso }}>{tp('variants')}</h2>
              <button type="button" onClick={addVariant} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', border: `1px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}>
                <Plus style={{ width: 14, height: 14 }} /> {tp('addVariant')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {formData.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12" style={{ gap: 10, padding: 14, border: `1.5px solid ${T.espresso}10` }}>
                  <div style={{ gridColumn: 'span 4' }}>
                    <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, marginBottom: 4, fontWeight: 300 }}>{tp('size')} *</label>
                    <input type="text" value={v.size} onChange={e => { const vv = [...formData.variants]; vv[i].size = e.target.value; setFormData(p => ({ ...p, variants: vv })) }}
                      placeholder={isRtl ? 'مثال: 50مل' : 'e.g., 50ml'}
                      style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${errors[`variant_${i}_size`] ? '#C0392B' : `${T.espresso}12`}`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { if (!errors[`variant_${i}_size`]) e.currentTarget.style.borderColor = `${T.espresso}12` }} />
                    {errors[`variant_${i}_size`] && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#C0392B', marginTop: 2, fontWeight: 300 }}>{errors[`variant_${i}_size`]}</p>}
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, marginBottom: 4, fontWeight: 300 }}>{tp('price')} (DA) *</label>
                    <input type="number" step="0.01" value={v.price} onChange={e => { const vv = [...formData.variants]; vv[i].price = parseFloat(e.target.value) || 0; setFormData(p => ({ ...p, variants: vv })) }}
                      style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${errors[`variant_${i}_price`] ? '#C0392B' : `${T.espresso}12`}`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { if (!errors[`variant_${i}_price`]) e.currentTarget.style.borderColor = `${T.espresso}12` }} />
                    {errors[`variant_${i}_price`] && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#C0392B', marginTop: 2, fontWeight: 300 }}>{errors[`variant_${i}_price`]}</p>}
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, marginBottom: 4, fontWeight: 300 }}>{tp('stock')} *</label>
                    <input type="number" value={v.stock} onChange={e => { const vv = [...formData.variants]; vv[i].stock = parseInt(e.target.value) || 0; setFormData(p => ({ ...p, variants: vv })) }}
                      style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${errors[`variant_${i}_stock`] ? '#C0392B' : `${T.espresso}12`}`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { if (!errors[`variant_${i}_stock`]) e.currentTarget.style.borderColor = `${T.espresso}12` }} />
                    {errors[`variant_${i}_stock`] && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#C0392B', marginTop: 2, fontWeight: 300 }}>{errors[`variant_${i}_stock`]}</p>}
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end' }}>
                    <button type="button" onClick={() => removeVariant(i)} disabled={formData.variants.length === 1}
                      style={{ width: '100%', padding: '8px 12px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#C0392B', border: `1px solid ${T.espresso}10`, backgroundColor: 'transparent', cursor: formData.variants.length === 1 ? 'not-allowed' : 'pointer', opacity: formData.variants.length === 1 ? 0.3 : 1 }}>
                      <Trash2 style={{ width: 14, height: 14, margin: '0 auto' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex" style={{ gap: 12, paddingTop: 8, borderTop: `1px solid ${T.gold}10` }}>
            <button type="submit" disabled={saving} style={{ padding: '12px 28px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: T.espresso, color: T.ivory, fontWeight: 500, transition: 'background-color 0.3s', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}} onMouseLeave={e => { if (!saving) { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}}>
              <Save style={{ width: 16, height: 16 }} />
              {saving ? tp('updating') : tp('save')}
            </button>
            <button type="button" onClick={() => router.back()} style={{ padding: '12px 28px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', border: `1.5px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}>
              {tc('cancel')}
            </button>
          </div>
        </div>
      </form>

      {/* Brand Modal */}
      <AnimatePresence>
        {showBrandModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: `${T.espresso}80`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ backgroundColor: T.cream, maxWidth: 420, width: '100%', padding: 28, position: 'relative' }}>
              <button onClick={() => setShowBrandModal(false)} style={{ position: 'absolute', top: 16, [isRtl ? 'left' : 'right']: 16, background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X style={{ width: 18, height: 18 }} /></button>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: T.espresso, marginBottom: 20 }}>{tc('add')} — {isRtl ? 'علامة تجارية' : 'Marque'}</h2>
              <form onSubmit={handleCreateBrand}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>{isRtl ? 'اسم العلامة التجارية' : 'Nom de la marque'} *</label>
                  <input type="text" value={brandFormData.name} onChange={e => setBrandFormData({ name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                    onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                    placeholder={isRtl ? 'مثال: شانيل' : 'e.g., Chanel'} required autoFocus />
                </div>
                <div className="flex" style={{ gap: 10 }}>
                  <button type="submit" disabled={savingBrand} style={{ flex: 1, padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: savingBrand ? 'not-allowed' : 'pointer', backgroundColor: T.espresso, color: T.ivory, fontWeight: 500, opacity: savingBrand ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!savingBrand) e.currentTarget.style.backgroundColor = T.gold }} onMouseLeave={e => { if (!savingBrand) e.currentTarget.style.backgroundColor = T.espresso }}>
                    {savingBrand ? tc('saving') + '...' : tc('save')}
                  </button>
                  <button type="button" onClick={() => setShowBrandModal(false)} style={{ padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', border: `1.5px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer' }}>{tc('cancel')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: `${T.espresso}80`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ backgroundColor: T.cream, maxWidth: 420, width: '100%', padding: 28, position: 'relative' }}>
              <button onClick={() => setShowCategoryModal(false)} style={{ position: 'absolute', top: 16, [isRtl ? 'left' : 'right']: 16, background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X style={{ width: 18, height: 18 }} /></button>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 300, color: T.espresso, marginBottom: 20 }}>{tc('add')} — {isRtl ? 'فئة' : 'Catégorie'}</h2>
              <form onSubmit={handleCreateCategory}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>{isRtl ? 'اسم الفئة' : 'Nom de la catégorie'} *</label>
                  <input type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({ name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                    onFocus={e => { e.currentTarget.style.borderColor = T.gold }} onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                    placeholder={isRtl ? 'مثال: شرقي' : 'e.g., Oriental'} required autoFocus />
                </div>
                <div className="flex" style={{ gap: 10 }}>
                  <button type="submit" disabled={savingCategory} style={{ flex: 1, padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: savingCategory ? 'not-allowed' : 'pointer', backgroundColor: T.espresso, color: T.ivory, fontWeight: 500, opacity: savingCategory ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!savingCategory) e.currentTarget.style.backgroundColor = T.gold }} onMouseLeave={e => { if (!savingCategory) e.currentTarget.style.backgroundColor = T.espresso }}>
                    {savingCategory ? tc('saving') + '...' : tc('save')}
                  </button>
                  <button type="button" onClick={() => setShowCategoryModal(false)} style={{ padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', border: `1.5px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer' }}>{tc('cancel')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}