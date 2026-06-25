/**
 * Admin Edit Promotion Page
 * 
 * DESCRIPTION:
 * Edit an existing promotion — update name, discount, dates, and variant selection.
 * 
 * FUNCTIONALITY:
 * - Fetch and populate existing promotion data
 * - Update name, discount type/value, dates, active status
 * - Searchable variant selector with pre-selected state
 * - Form validation
 * 
 * BACKEND INTEGRATION:
 * - GET /api/admin/promotions/[id] — fetch promotion with variants
 * - GET /api/admin/variants — all variants for selection
 * - PUT /api/admin/promotions/[id] — update promotion
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Search, Package } from 'lucide-react'
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

interface Variant {
  id: string
  productName: string
  brandName: string
  size: string
  price: number
  stock: number
  imageUrl: string | null
  hasPromotion: boolean
  promotionName: string | null
  productSlug: string
  gender?: string
  isFeatured?: boolean
  isNewArrival?: boolean
}

interface FormData {
  name: string
  discountType: 'percentage' | 'fixed'
  discountValue: string
  startDate: string
  endDate: string
  isActive: boolean
  variantIds: string[]
}

export default function EditPromotionPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const tp = useTranslations('admin.promotions')
  const tc = useTranslations('admin.common')
  const isRtl = locale === 'ar'
  const promotionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    name: '', discountType: 'percentage', discountValue: '',
    startDate: '', endDate: '', isActive: true, variantIds: [],
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/promotions/${promotionId}`).then(r => r.json()),
      fetch('/api/admin/variants').then(r => r.json()),
    ]).then(([promoData, variantsData]) => {
      const promo = promoData.promotion
      if (promo) {
        setFormData({
          name: promo.name,
          discountType: promo.discountType || 'percentage',
          discountValue: promo.discountValue ? promo.discountValue.toString() : '',
          startDate: new Date(promo.startDate).toISOString().slice(0, 10),
          endDate: new Date(promo.endDate).toISOString().slice(0, 10),
          isActive: promo.isActive,
          variantIds: promo.promotionVariants?.map((pv: any) => pv.variantId) || [],
        })
      }
      setVariants(variantsData.variants || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [promotionId])

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = isRtl ? 'الاسم مطلوب' : 'Name is required'
    const dv = parseFloat(formData.discountValue)
    if (!formData.discountValue || isNaN(dv) || dv <= 0) errs.discountValue = isRtl ? 'قيمة الخصم مطلوبة' : 'Valid discount value is required'
    else if (formData.discountType === 'percentage' && dv > 100) errs.discountValue = isRtl ? 'النسبة لا تتجاوز 100%' : 'Percentage cannot exceed 100%'
    if (!formData.startDate) errs.startDate = isRtl ? 'تاريخ البدء مطلوب' : 'Start date is required'
    if (!formData.endDate) errs.endDate = isRtl ? 'تاريخ الانتهاء مطلوب' : 'End date is required'
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate))
      errs.endDate = isRtl ? 'تاريخ الانتهاء بعد تاريخ البدء' : 'End date must be after start date'
    if (formData.variantIds.length === 0) errs.variantIds = isRtl ? 'اختر متغيراً واحداً على الأقل' : 'Select at least one variant'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/promotions/${promotionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          startDate: formData.startDate, endDate: formData.endDate,
          isActive: formData.isActive, variantIds: formData.variantIds,
        }),
      })
      if (res.ok) { toast.success(isRtl ? 'تم تحديث العرض' : 'Promotion mise à jour'); router.push('/admin/promotions') }
      else { const d = await res.json(); toast.error(d.error || tc('error')) }
    } catch {
      toast.error(tc('error'))
    }
    setSaving(false)
  }

  const toggleVariant = (id: string) => {
    setFormData(p => ({ ...p, variantIds: p.variantIds.includes(id) ? p.variantIds.filter(x => x !== id) : [...p.variantIds, id] }))
    if (errors.variantIds) setErrors(p => ({ ...p, variantIds: '' }))
  }

  const filtered = variants.filter(v =>
    (v.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.size || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, transition: 'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = T.espresso }}
          onMouseLeave={e => { e.currentTarget.style.color = T.muted }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
          {tc('back')}
        </button>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso }}>
          {tp('editTitle')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
        <div style={{ backgroundColor: T.cream, border: `1px solid ${T.gold}12`, padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
              {tp('name')} *
            </label>
            <input type="text" value={formData.name} onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
              style={{ width: '100%', padding: '11px 16px', border: `1.5px solid ${errors.name ? '#C0392B' : T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
              onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
              onBlur={e => { if (!errors.name) e.currentTarget.style.borderColor = `${T.espresso}12` }}
              placeholder={isRtl ? 'مثال: تخفيض الصيف' : 'e.g., Summer Sale'} />
            {errors.name && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors.name}</p>}
          </div>

          {/* Discount */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {tp('discountType')} *
              </label>
              <select value={formData.discountType} onChange={e => setFormData(p => ({ ...p, discountType: e.target.value as any, discountValue: '' }))}
                style={{ width: '100%', padding: '11px 16px', border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300, cursor: 'pointer' }}>
                <option value="percentage">{tp('percentage')}</option>
                <option value="fixed">{tp('fixedAmount')}</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                {formData.discountType === 'percentage' ? tp('percentage') : tp('fixedAmount')} *
              </label>
              <input type="number" step="0.01" min="0" max={formData.discountType === 'percentage' ? '100' : undefined}
                value={formData.discountValue} onChange={e => { setFormData(p => ({ ...p, discountValue: e.target.value })); if (errors.discountValue) setErrors(p => ({ ...p, discountValue: '' })) }}
                style={{ width: '100%', padding: '11px 16px', border: `1.5px solid ${errors.discountValue ? '#C0392B' : T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { if (!errors.discountValue) e.currentTarget.style.borderColor = `${T.espresso}12` }}
                placeholder={formData.discountType === 'percentage' ? '20' : '1000'} />
              {errors.discountValue && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors.discountValue}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            {['startDate', 'endDate'].map(field => (
              <div key={field}>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontWeight: 500 }}>
                  {field === 'startDate' ? tp('startDate') : tp('endDate')} *
                </label>
                <input type="date" value={formData[field as keyof typeof formData] as string}
                  onChange={e => { setFormData(p => ({ ...p, [field]: e.target.value })); if (errors[field]) setErrors(p => ({ ...p, [field]: '' })) }}
                  style={{ width: '100%', padding: '11px 16px', border: `1.5px solid ${errors[field] ? '#C0392B' : T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                  onBlur={e => { if (!errors[field]) e.currentTarget.style.borderColor = `${T.espresso}12` }} />
                {errors[field] && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors[field]}</p>}
              </div>
            ))}
          </div>

          {/* Active toggle */}
          <label className="flex items-center" style={{ gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: T.gold }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.espresso, fontWeight: 400 }}>
              {tp('active')}
            </span>
          </label>

          {/* Variants */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 10, fontWeight: 500 }}>
              {tp('variants')} *
            </label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: 12, width: 16, height: 16, color: `${T.muted}80` }} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', paddingInlineStart: 38, border: `1.5px solid ${T.espresso}12`, fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, backgroundColor: T.ivory, outline: 'none', fontWeight: 300 }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}12` }}
                placeholder={tp('searchVariants')} />
            </div>
            <div style={{ border: `1.5px solid ${errors.variantIds ? '#C0392B' : `${T.espresso}12`}`, maxHeight: 460, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <p style={{ padding: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, fontWeight: 300 }}>{tc('noResults')}</p>
              ) : (
                filtered.map(v => (
                  <label key={v.id} className="flex items-center" style={{ gap: 12, padding: 12, borderBottom: `1px solid ${T.gold}08`, cursor: 'pointer', transition: 'background-color 0.15s', backgroundColor: formData.variantIds.includes(v.id) ? `${T.gold}06` : 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = formData.variantIds.includes(v.id) ? `${T.gold}0A` : T.dust }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = formData.variantIds.includes(v.id) ? `${T.gold}06` : 'transparent' }}>
                    <input type="checkbox" checked={formData.variantIds.includes(v.id)} onChange={() => toggleVariant(v.id)}
                      style={{ width: 18, height: 18, flexShrink: 0, accentColor: T.gold }} />
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt="" style={{ width: 52, height: 64, objectFit: 'cover', flexShrink: 0, border: `1px solid ${T.gold}10` }} />
                    ) : (
                      <div style={{ width: 52, height: 64, backgroundColor: T.dust, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package style={{ width: 20, height: 20, color: `${T.muted}50` }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.productName}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 4 }}>{v.brandName} · {v.size}</p>
                      <div className="flex" style={{ gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '1px 7px', backgroundColor: `${T.gold}12`, color: T.gold }}>
                          {Number(v.price).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DA
                        </span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, padding: '1px 7px', backgroundColor: v.stock === 0 ? '#FEE2E2' : v.stock <= 5 ? '#FEF3C7' : '#DCFCE7', color: v.stock === 0 ? '#991B1B' : v.stock <= 5 ? '#92400E' : '#166534' }}>
                          {v.stock === 0 ? (isRtl ? 'نفد' : 'Épuisé') : v.stock}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {errors.variantIds && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 4, fontWeight: 300 }}>{errors.variantIds}</p>}
            {formData.variantIds.length > 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, marginTop: 6, fontWeight: 300 }}>
                {formData.variantIds.length} {isRtl ? 'محدد' : 'sélectionné(s)'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex" style={{ gap: 12, paddingTop: 4 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '12px 28px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: T.espresso, color: T.ivory, fontWeight: 500, transition: 'background-color 0.3s', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = T.gold }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = T.espresso }}>
              <Save style={{ width: 16, height: 16 }} />
              {saving ? tp('updating') : tp('save')}
            </button>
            <button type="button" onClick={() => router.back()}
              style={{ padding: '12px 28px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', border: `1.5px solid ${T.espresso}15`, backgroundColor: 'transparent', color: T.espresso, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}>
              {tc('cancel')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}