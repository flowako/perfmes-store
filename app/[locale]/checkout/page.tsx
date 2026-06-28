"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { WILAYAS } from '@/lib/wilayas'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Home, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

const T = {
  ivory:    "#F7F4EF",
  cream:    "#FFFFFF",
  gold:     "#C9A96E",
  espresso: "#1A1714",
  linen:    "#E8E2D9",
  muted:    "#8B7E74",
  dust:     "#F2EDE6",
  ink:      "#2C2420",
}

interface FormData {
  fullName: string
  phone: string
  wilaya: string
  commune: string
  address: string
  notes: string
}

interface FormErrors {
  fullName?: string
  phone?: string
  wilaya?: string
  commune?: string
  address?: string
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-lg"
          style={{ padding: '14px 28px', backgroundColor: T.espresso, color: T.ivory, fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em' }}
        >
          <span className="flex items-center gap-2.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('checkout')
  const isRtl = locale === 'ar'
  const { cart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
  const [orderReference, setOrderReference] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (message: string) => {
    setToastMessage(message)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    if (cart.items.length === 0 && !orderReference) {
      router.push(`/products/men`)
    }
  }, [cart.items.length, orderReference, router, locale])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = isRtl ? 'الاسم الكامل مطلوب' : 'Le nom complet est requis'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = isRtl ? 'يجب أن يحتوي الاسم على 3 أحرف على الأقل' : 'Le nom doit contenir au moins 3 caractères'
    }

    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/
    if (!formData.phone.trim()) {
      newErrors.phone = isRtl ? 'رقم الهاتف مطلوب' : 'Le numéro de téléphone est requis'
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = isRtl ? 'صيغة غير صالحة (مثال: 0555123456)' : 'Format invalide (ex: 0555123456)'
    }

    if (!formData.wilaya) {
      newErrors.wilaya = isRtl ? 'الرجاء اختيار ولاية' : 'Veuillez sélectionner une wilaya'
    }

    if (!formData.commune.trim()) {
      newErrors.commune = isRtl ? 'البلدية مطلوبة' : 'La commune est requise'
    } else if (formData.commune.trim().length < 2) {
      newErrors.commune = isRtl ? 'يجب أن تحتوي البلدية على حرفين على الأقل' : 'La commune doit contenir au moins 2 caractères'
    }

    if (!formData.address.trim()) {
      newErrors.address = isRtl ? 'العنوان مطلوب' : "L'adresse est requise"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = isRtl ? 'يجب أن يحتوي العنوان على 10 أحرف على الأقل' : "L'adresse doit contenir au moins 10 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            productNameFr: item.productName,
            productNameAr: item.productNameAr || item.productName,
            brandNameFr: item.brandName,
            brandNameAr: item.brandName,
            variantSize: item.variantSize,
          })),
          total: cart.total,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || (isRtl ? 'فشل إنشاء الطلب' : 'Échec de la création de la commande'))
        setLoading(false)
        return
      }

      setOrderReference(data.reference)
      setShowConfirmationPopup(true)
      clearCart()
      setLoading(false)
    } catch {
      showToast(isRtl ? 'حدث خطأ. الرجاء المحاولة مرة أخرى.' : 'Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (orderReference) {
      navigator.clipboard.writeText(orderReference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (cart.items.length === 0 && !orderReference) {
    return null
  }

  return (
    <div style={{ backgroundColor: T.ivory, minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />

      {/* Banner — identical to products listing */}
      <div className="relative overflow-hidden py-16 md:py-24 px-6" style={{ backgroundColor: T.espresso }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="cg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={T.gold} stopOpacity="0.1"/>
              <stop offset="100%" stopColor={T.gold} stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="1440" height="300" fill="url(#cg)"/>
          <line x1="0" y1="1" x2="1440" y2="1" stroke={T.gold} strokeOpacity="0.12" strokeWidth="1"/>
          <line x1="0" y1="299" x2="1440" y2="299" stroke={T.gold} strokeOpacity="0.12" strokeWidth="1"/>
        </svg>
        <div className="relative max-w-7xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[9px] tracking-[0.5em] uppercase mb-4"
            style={{ fontFamily: 'Inter, sans-serif', color: T.gold }}>
            Maison Éclore · Paris
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="leading-none"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              fontWeight: 300,
              color: T.ivory,
            }}
          >
            {t('title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-3 text-sm max-w-md"
            style={{ fontFamily: 'Inter, sans-serif', color: `${T.ivory}50`, fontWeight: 300 }}>
            {cart.itemCount} {t('items')}
          </motion.p>
        </div>
      </div>

      <main className="py-12 md:py-16">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '2.5rem' }}>
            {/* Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col" style={{ gap: '1.25rem' }}>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: T.muted, fontWeight: 500, marginBottom: 8 }}>
                      {t('fullName')} *
                    </label>
                    <input
                      type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange}
                      style={{
                        width: '100%', padding: '12px 16px', backgroundColor: T.cream,
                        border: `1.5px solid ${errors.fullName ? '#C0392B' : `${T.espresso}10`}`,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 300,
                        outline: 'none', transition: 'border-color 0.2s',
                        direction: isRtl ? 'rtl' : 'ltr',
                      }}
                      onFocus={e => { if (!errors.fullName) e.currentTarget.style.borderColor = T.gold }}
                      onBlur={e => { if (!errors.fullName) e.currentTarget.style.borderColor = `${T.espresso}10` }}
                      placeholder={isRtl ? 'اسمك الكامل' : 'Votre nom complet'}
                    />
                    {errors.fullName && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 5, fontWeight: 300 }}>{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: T.muted, fontWeight: 500, marginBottom: 8 }}>
                      {t('phone')} *
                    </label>
                    <input
                      type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                      style={{
                        width: '100%', padding: '12px 16px', backgroundColor: T.cream,
                        border: `1.5px solid ${errors.phone ? '#C0392B' : `${T.espresso}10`}`,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 300,
                        outline: 'none', transition: 'border-color 0.2s',
                        direction: isRtl ? 'rtl' : 'ltr',
                      }}
                      onFocus={e => { if (!errors.phone) e.currentTarget.style.borderColor = T.gold }}
                      onBlur={e => { if (!errors.phone) e.currentTarget.style.borderColor = `${T.espresso}10` }}
                      placeholder="0555123456"
                    />
                    {errors.phone && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 5, fontWeight: 300 }}>{errors.phone}</p>}
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label htmlFor="wilaya" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: T.muted, fontWeight: 500, marginBottom: 8 }}>
                      {t('wilaya')} *
                    </label>
                    <select
                      id="wilaya" name="wilaya" value={formData.wilaya} onChange={handleChange}
                      style={{
                        width: '100%', padding: '12px 16px', backgroundColor: T.cream,
                        border: `1.5px solid ${errors.wilaya ? '#C0392B' : `${T.espresso}10`}`,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 300,
                        outline: 'none', transition: 'border-color 0.2s', cursor: 'pointer',
                      }}
                      onFocus={e => { if (!errors.wilaya) e.currentTarget.style.borderColor = T.gold }}
                      onBlur={e => { if (!errors.wilaya) e.currentTarget.style.borderColor = `${T.espresso}10` }}
                    >
                      <option value="">{t('selectWilaya')}</option>
                      {WILAYAS.map(wilaya => (
                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                      ))}
                    </select>
                    {errors.wilaya && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 5, fontWeight: 300 }}>{errors.wilaya}</p>}
                  </div>

                  {/* Commune */}
                  <div>
                    <label htmlFor="commune" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: T.muted, fontWeight: 500, marginBottom: 8 }}>
                      {t('commune')} *
                    </label>
                    <input
                      type="text" id="commune" name="commune" value={formData.commune} onChange={handleChange}
                      style={{
                        width: '100%', padding: '12px 16px', backgroundColor: T.cream,
                        border: `1.5px solid ${errors.commune ? '#C0392B' : `${T.espresso}10`}`,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 300,
                        outline: 'none', transition: 'border-color 0.2s',
                        direction: isRtl ? 'rtl' : 'ltr',
                      }}
                      onFocus={e => { if (!errors.commune) e.currentTarget.style.borderColor = T.gold }}
                      onBlur={e => { if (!errors.commune) e.currentTarget.style.borderColor = `${T.espresso}10` }}
                      placeholder={isRtl ? 'بلديتك' : 'Votre commune'}
                    />
                    {errors.commune && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 5, fontWeight: 300 }}>{errors.commune}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: T.muted, fontWeight: 500, marginBottom: 8 }}>
                      {t('address')} *
                    </label>
                    <textarea
                      id="address" name="address" value={formData.address} onChange={handleChange} rows={3}
                      style={{
                        width: '100%', padding: '12px 16px', backgroundColor: T.cream, resize: 'none',
                        border: `1.5px solid ${errors.address ? '#C0392B' : `${T.espresso}10`}`,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 300,
                        outline: 'none', transition: 'border-color 0.2s',
                        direction: isRtl ? 'rtl' : 'ltr',
                      }}
                      onFocus={e => { if (!errors.address) e.currentTarget.style.borderColor = T.gold }}
                      onBlur={e => { if (!errors.address) e.currentTarget.style.borderColor = `${T.espresso}10` }}
                      placeholder={isRtl ? 'الشارع، الرقم، المبنى، إلخ.' : 'Rue, numéro, bâtiment, etc.'}
                    />
                    {errors.address && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C0392B', marginTop: 5, fontWeight: 300 }}>{errors.address}</p>}
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: T.muted, fontWeight: 500, marginBottom: 8 }}>
                      {t('notes')}
                    </label>
                    <textarea
                      id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} maxLength={300}
                      style={{
                        width: '100%', padding: '12px 16px', backgroundColor: T.cream, resize: 'none',
                        border: `1.5px solid ${T.espresso}10`,
                        fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.espresso, fontWeight: 300,
                        outline: 'none', transition: 'border-color 0.2s',
                        direction: isRtl ? 'rtl' : 'ltr',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.gold }}
                      onBlur={e => { e.currentTarget.style.borderColor = `${T.espresso}10` }}
                      placeholder={isRtl ? 'تعليمات التوصيل، التفضيلات، إلخ.' : 'Instructions de livraison, préférences, etc.'}
                    />
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, textAlign: 'right', marginTop: 4, fontWeight: 300 }}>
                      {formData.notes.length}/300
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit" disabled={loading}
                  whileTap={loading ? undefined : { scale: 0.98 }}
                  style={{
                    width: '100%', padding: '15px 24px', marginTop: 28,
                    fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    backgroundColor: T.espresso, color: T.ivory,
                    transition: 'background-color 0.3s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ border: `1.5px solid ${T.ivory}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>
                      {t('processing')}
                    </span>
                  ) : (
                    t('confirmOrder')
                  )}
                </motion.button>

                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, textAlign: 'center', marginTop: 14, fontWeight: 300 }}>
                  {t('cod')}
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div style={{ backgroundColor: T.cream, padding: 24, position: 'sticky', top: '7rem' }}>
                {/* Mobile: Collapsible */}
                <button
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  className="lg:hidden w-full flex items-center justify-between"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16 }}
                >
                  <span style={{ fontWeight: 500 }}>{t('orderSummary')} ({cart.itemCount})</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', color: T.gold }}>{cart.total.toFixed(2)} DA</span>
                </button>

                <div className={`${summaryExpanded ? 'block' : 'hidden'} lg:block`}>
                  <h2 className="hidden lg:block" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 300, color: T.espresso, marginBottom: 20 }}>
                    {t('orderSummary')}
                  </h2>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24, maxHeight: 360, overflowY: 'auto' }}>
                    {cart.items.map(item => (
                      <div key={item.variantId} className="flex" style={{ gap: 12 }}>
                        <div className="relative flex-shrink-0" style={{ width: 60, height: 76, backgroundColor: T.dust }}>
                          <Image src={item.imageUrl} alt={item.productName} fill className="object-contain" style={{ padding: 4 }} />
                        </div>
                        <div className="flex-1" style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.brandName}
                          </p>
                          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 300, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.productName}
                          </h3>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.muted, fontWeight: 300, marginBottom: 4 }}>
                            {item.variantSize} × {item.quantity}
                          </p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 400 }}>
                            {(item.price * item.quantity).toFixed(2)} DA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{ borderTop: `1px solid ${T.gold}15`, paddingTop: 16 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{t('subtotal')}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 400 }}>{cart.total.toFixed(2)} DA</span>
                    </div>
                    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300 }}>{t('shipping')}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.espresso, fontWeight: 300 }}>{t('shippingCalculatedAtConfirm')}</span>
                    </div>
                    <div className="flex items-center justify-between" style={{ borderTop: `1px solid ${T.gold}15`, paddingTop: 14, marginTop: 4 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: T.espresso }}>{t('total')}</span>
                      <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 400, color: T.gold }}>{cart.total.toFixed(2)} DA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirmation Popup */}
      <AnimatePresence>
        {showConfirmationPopup && orderReference && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmationPopup(false)}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: `${T.espresso}99`, backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto relative" style={{ backgroundColor: T.cream, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={() => setShowConfirmationPopup(false)}
                  className="absolute flex items-center justify-center transition-colors z-10"
                  style={{ top: 16, [isRtl ? 'left' : 'right']: 16, width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.espresso }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.muted }}
                  aria-label="Close">
                  <X style={{ width: 18, height: 18 }} />
                </button>

                <div style={{ padding: '48px 40px' }}>
                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: 80, height: 80, margin: '0 auto 24px', position: 'relative' }}
                  >
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#F0FAF4', borderRadius: '50%' }} />
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }} xmlns="http://www.w3.org/2000/svg">
                      <motion.path d="M25 50 L40 65 L75 30" stroke="#2D8B4E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      />
                    </svg>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 36 }}
                  >
                    <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso, marginBottom: 10 }}>
                      {t('thankYou')}
                    </h2>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, lineHeight: 1.6, fontWeight: 300 }}>
                      {t('weWillContact')}
                    </p>
                  </motion.div>

                  {/* Reference */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    style={{ backgroundColor: T.dust, padding: 20, marginBottom: 28, border: `1px solid ${T.gold}18` }}
                  >
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: T.muted, textAlign: 'center', marginBottom: 10 }}>
                      {t('reference')}
                    </p>
                    <div className="flex items-center justify-center" style={{ gap: 12 }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '1.4rem', color: T.gold, letterSpacing: '0.1em' }}>
                        {orderReference}
                      </code>
                      <button onClick={copyToClipboard} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: T.muted, transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = T.gold }}
                        onMouseLeave={e => { e.currentTarget.style.color = T.muted }}
                        aria-label="Copy reference">
                        {copied ? <Check style={{ width: 16, height: 16, color: '#2D8B4E' }} /> : <Copy style={{ width: 16, height: 16 }} />}
                      </button>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: T.muted, textAlign: 'center', marginTop: 12, fontWeight: 300 }}>
                      {t('saveReference')}
                    </p>
                  </motion.div>

                  {/* Next Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    style={{ backgroundColor: T.dust, padding: 20, marginBottom: 28 }}
                  >
                    <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, color: T.espresso, marginBottom: 16 }}>
                      {t('nextSteps')}
                    </h3>
                    <ol style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 0, margin: 0, listStyle: 'none' }}>
                      {[
                        { title: t('stepConfirmation'), desc: t('stepConfirmationDesc') },
                        { title: t('stepPackaging'), desc: t('stepPackagingDesc') },
                        { title: t('stepDelivery'), desc: t('stepDeliveryDesc') },
                      ].map((step, i) => (
                        <li key={i} className="flex" style={{ gap: 12 }}>
                          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: `${T.gold}18` }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: T.gold }}>{i + 1}</span>
                          </div>
                          <div>
                            <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: T.espresso, marginBottom: 2 }}>{step.title}</h4>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, lineHeight: 1.5, fontWeight: 300 }}>{step.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="flex flex-col sm:flex-row" style={{ gap: 12 }}
                  >
                    <button onClick={() => { setShowConfirmationPopup(false); router.push(`/${locale}`) }}
                      style={{
                        flex: 1, padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.25em',
                        textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        backgroundColor: T.espresso, color: T.ivory, border: 'none', cursor: 'pointer',
                        transition: 'background-color 0.3s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.gold }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.espresso }}>
                      <Home style={{ width: 14, height: 14 }} />
                      {t('backHome')}
                    </button>
                    <button onClick={() => { setShowConfirmationPopup(false); router.push(`/products/men`) }}
                      style={{
                        flex: 1, padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.25em',
                        textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'transparent', color: T.espresso, border: `1px solid ${T.espresso}15`, cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}>
                      {t('continueShopping')}
                    </button>
                  </motion.div>

                  {/* Contact */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65, duration: 0.6 }}
                    style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.gold}12`, textAlign: 'center' }}
                  >
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.muted, marginBottom: 2, fontWeight: 300 }}>
                      {t('contactQuestion')}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.espresso, fontWeight: 300 }}>
                      {t('contactMessage')}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  )
}