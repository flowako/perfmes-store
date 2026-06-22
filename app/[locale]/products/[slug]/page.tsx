"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShoppingBag, Share2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'

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

const GENDER_MAP = {
  MEN: { fr: 'Homme', ar: 'رجالي' },
  WOMEN: { fr: 'Femme', ar: 'نسائي' },
  UNISEX: { fr: 'Unisexe', ar: 'للجنسين' },
}

interface Variant {
  id: string
  size: string
  price: number
  stock: number
  effectivePrice: number
  originalPrice: number
  hasPromotion: boolean
  promotion: { name: string; endDate: string } | null
}

interface ProductImage {
  id: string
  url: string
  altFr?: string
  altAr?: string
  order: number
}

interface ProductTranslation {
  locale: 'ar' | 'fr'
  name: string
  description: string
}

interface ProductCategory {
  id: string
  name: string
  slug: string
}

interface RelatedProduct {
  id: string
  slug: string
  brand: { id: string; name: string; slug: string }
  minPrice: number
  promoPrice: number | null
  translations: { locale: string; name: string; description: string }[]
  images: { id: string; url: string }[]
}

interface Product {
  id: string
  slug: string
  gender: string
  isFeatured: boolean
  isNewArrival: boolean
  brand: { id: string; name: string; slug: string }
  translations: ProductTranslation[]
  categories: ProductCategory[]
  images: ProductImage[]
  variants: Variant[]
  relatedProducts: RelatedProduct[]
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

export default function ProductDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('productDetail')
  const isRtl = locale === 'ar'
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [imgLoaded, setImgLoaded] = useState(false)

  const showToast = (message: string) => {
    setToastMessage(message)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2200)
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const slug = params.slug as string
        const res = await fetch(`/api/products/${slug}?locale=${locale}`)
        if (!res.ok) {
          const errorData = await res.json()
          setError(res.status === 404 ? 'not_found' : errorData.error || 'load_failed')
          setLoading(false)
          return
        }
        const data = await res.json()
        setProduct(data.product)
        if (data.product.variants.length > 0) setSelectedVariant(data.product.variants[0])
        setLoading(false)
      } catch {
        setError('load_failed')
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.slug, locale])

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return
    const frTr = product.translations.find(x => x.locale === 'fr')
    const arTr = product.translations.find(x => x.locale === 'ar')
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: frTr?.name || 'Product',
      productNameAr: arTr?.name,
      productSlug: product.slug,
      brandName: product.brand.name,
      variantSize: selectedVariant.size,
      price: selectedVariant.effectivePrice,
      originalPrice: selectedVariant.originalPrice,
      imageUrl: product.images[0]?.url || '',
      maxStock: selectedVariant.stock,
    }, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: translation?.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      showToast(t('linkCopied'))
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t('outOfStock'), color: '#C0392B', bg: '#FDF2F2' }
    if (stock <= 5) return { label: t('lowStock'), color: '#B8860B', bg: '#FFF8E7' }
    return { label: t('inStock'), color: '#2D8B4E', bg: '#F0FAF4' }
  }

  const genderLabel = (g: string) => {
    const key = g as keyof typeof GENDER_MAP
    return GENDER_MAP[key]?.[locale as 'fr' | 'ar'] || g
  }

  const translation = product?.translations.find(t => t.locale === locale)
    || product?.translations.find(t => t.locale === 'fr')
    || product?.translations[0]

  if (loading) {
    return (
      <div style={{ backgroundColor: T.ivory, minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <div className="flex items-center justify-center" style={{ paddingTop: '9rem', paddingBottom: '5rem' }}>
          <div className="text-center">
            <div className="w-6 h-6 rounded-full mx-auto mb-4" style={{ border: `1.5px solid ${T.gold}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, fontWeight: 300, letterSpacing: '0.05em' }}>{t('loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ backgroundColor: T.ivory, minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <div className="flex items-center justify-center px-6" style={{ paddingTop: '9rem', paddingBottom: '5rem' }}>
          <div className="text-center" style={{ maxWidth: 380 }}>
            <div className="mb-6" style={{ opacity: 0.2 }}>
              <svg viewBox="0 0 120 280" fill="none" style={{ height: 90, width: 'auto', margin: '0 auto' }}>
                <rect x="44" y="8" width="32" height="16" rx="2.5" fill={T.muted} opacity="0.55"/>
                <rect x="48" y="4" width="24" height="8" rx="2" fill={T.muted} opacity="0.65"/>
                <path d="M47 24 L45 54 L75 54 L73 24Z" fill={T.muted} opacity="0.15"/>
                <path d="M28 72 Q45 54 57 54 L63 54 Q75 54 92 72 L95 88 L25 88Z" fill={T.muted} opacity="0.15"/>
                <rect x="25" y="88" width="70" height="162" rx="1" fill={T.muted} opacity="0.12"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, color: T.espresso, marginBottom: 10 }}>{t('productNotFound')}</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, marginBottom: 28, fontWeight: 300, lineHeight: 1.6 }}>{t('productNotFoundDesc')}</p>
            <a href={`/${locale}/products`}
              className="inline-flex items-center justify-center"
              style={{ padding: '13px 32px', backgroundColor: T.espresso, color: T.ivory, fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', transition: 'background-color 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.gold }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.espresso }}
            >
              {t('browseProducts')}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const currentImage = product.images[selectedImageIndex]
  const stockStatus = selectedVariant ? getStockStatus(selectedVariant.stock) : null
  const name = translation?.name || ''
  const description = translation?.description || ''
  const badges: { label: string; bg: string; color: string }[] = []
  if (product.isNewArrival) badges.push({ label: locale === 'ar' ? 'جديد' : 'Nouveau', bg: T.gold, color: T.espresso })
  if (product.isFeatured) badges.push({ label: locale === 'ar' ? 'مميز' : 'Sélection', bg: T.espresso, color: T.ivory })
  if (selectedVariant?.hasPromotion && selectedVariant.promotion) badges.push({ label: locale === 'ar' ? 'تخفيض' : 'Promo', bg: '#2D8B4E', color: '#FFFFFF' })

  return (
    <div style={{ backgroundColor: T.ivory, minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />

      {/* Banner — identical to products listing */}
      <div className="relative overflow-hidden py-16 md:py-24 px-6" style={{ backgroundColor: T.espresso }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="pg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={T.gold} stopOpacity="0.1"/>
              <stop offset="100%" stopColor={T.gold} stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="1440" height="300" fill="url(#pg)"/>
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
              maxWidth: '16ch',
            }}
          >
            {name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-3 text-sm max-w-md"
            style={{ fontFamily: 'Inter, sans-serif', color: `${T.ivory}50`, fontWeight: 300 }}>
            {product.brand.name} · {genderLabel(product.gender)}
          </motion.p>
        </div>
      </div>

      <main style={{ paddingBottom: '4rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {/* Product Grid - starts below banner naturally */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" style={{ marginTop: '2rem' }}>
            {/* Image Gallery */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden bg-white shadow-sm"
                style={{ aspectRatio: '3/4', maxHeight: 540, borderBottom: `1px solid ${T.gold}12` }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={currentImage?.url || '/placeholder.png'}
                      alt={isRtl ? (currentImage?.altAr || name) : (currentImage?.altFr || name)}
                      fill
                      className="object-contain"
                      style={{ padding: '2.5rem', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s' }}
                      priority
                      onLoad={() => setImgLoaded(true)}
                    />
                  </motion.div>
                </AnimatePresence>

                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(p => (p === 0 ? product.images.length - 1 : p - 1))}
                      className="absolute flex items-center justify-center transition-all duration-300 group-hover:opacity-100"
                      style={{
                        [isRtl ? 'right' : 'left']: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 36, height: 36,
                        backgroundColor: `${T.ivory}E0`,
                        border: 'none', cursor: 'pointer',
                        opacity: 0.3,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.ivory; e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${T.ivory}E0`; e.currentTarget.style.opacity = '0.3' }}
                      aria-label={t('previousImage')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.espresso} strokeWidth="1.5" style={{ transform: isRtl ? 'rotate(180deg)' : undefined }}>
                        <polyline points="15,18 9,12 15,6"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(p => (p === product.images.length - 1 ? 0 : p + 1))}
                      className="absolute flex items-center justify-center transition-all duration-300 group-hover:opacity-100"
                      style={{
                        [isRtl ? 'left' : 'right']: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 36, height: 36,
                        backgroundColor: `${T.ivory}E0`,
                        border: 'none', cursor: 'pointer',
                        opacity: 0.3,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = T.ivory; e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${T.ivory}E0`; e.currentTarget.style.opacity = '0.3' }}
                      aria-label={t('nextImage')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.espresso} strokeWidth="1.5" style={{ transform: isRtl ? 'rotate(180deg)' : undefined }}>
                        <polyline points="9,18 15,12 9,6"/>
                      </svg>
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto scrollbar-none" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => { setSelectedImageIndex(idx); setImgLoaded(false) }}
                      className="relative flex-shrink-0 transition-all"
                      style={{
                        width: 58, height: 70,
                        backgroundColor: T.dust,
                        border: `1.5px solid ${idx === selectedImageIndex ? T.gold : 'transparent'}`,
                        cursor: 'pointer', padding: 0,
                        opacity: idx === selectedImageIndex ? 1 : 0.5,
                      }}
                      onMouseEnter={e => { if (idx !== selectedImageIndex) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.borderColor = `${T.muted}30` }}}
                      onMouseLeave={e => { if (idx !== selectedImageIndex) { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.borderColor = 'transparent' }}}
                    >
                      <Image src={img.url} alt="" fill className="object-contain" style={{ padding: 4 }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5" style={{ paddingTop: '0.25rem' }}>
              {/* Brand line + badges row */}
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <a href={`/${locale}/products?brand=${product.brand.slug}`}
                  className="inline-block transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: T.muted }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.gold }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.muted }}
                >
                  {product.brand.name}
                </a>
                <div className="flex gap-1.5">
                  {badges.map((b, i) => (
                    <span key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, padding: '2px 7px', backgroundColor: b.bg, color: b.color }}>
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Product name */}
              <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 300, color: T.espresso, lineHeight: 1.08, marginBottom: 4 }}>
                {name}
              </h1>

              {/* Meta row: gender + categories */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted, padding: '2px 10px', backgroundColor: `${T.muted}0D` }}>
                  {genderLabel(product.gender)}
                </span>
                {product.categories?.map(c => (
                  <span key={c.id} style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${T.muted}80`, padding: '2px 10px', backgroundColor: `${T.muted}08` }}>
                    {c.name}
                  </span>
                ))}
              </div>

              {/* Price row */}
              <div className="flex items-baseline gap-3 flex-wrap mb-4">
                {selectedVariant?.hasPromotion ? (
                  <>
                    <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: T.gold }}>
                      {Number(selectedVariant.effectivePrice).toFixed(2)} DA
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, textDecoration: 'line-through', fontWeight: 300 }}>
                      {Number(selectedVariant.originalPrice).toFixed(2)} DA
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: '#2D8B4E', backgroundColor: '#F0FAF4', padding: '2px 8px' }}>
                      {t('youSave')} {(Number(selectedVariant.originalPrice) - Number(selectedVariant.effectivePrice)).toFixed(2)} DA
                    </span>
                    {selectedVariant.promotion?.name && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: `${T.gold}CC`, fontStyle: 'italic', fontWeight: 300 }}>
                        {selectedVariant.promotion.name}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: T.espresso }}>
                    {selectedVariant ? Number(selectedVariant.effectivePrice).toFixed(2) : '0.00'} DA
                  </span>
                )}
              </div>

              {/* Stock badge */}
              <div className="flex items-center gap-3 mb-4">
                {selectedVariant && stockStatus && (
                  <div className="flex items-center gap-2" style={{ padding: '3px 10px', backgroundColor: stockStatus.bg }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: stockStatus.color, display: 'inline-block' }}/>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 500, color: stockStatus.color }}>{stockStatus.label}</span>
                  </div>
                )}
              </div>
              <div style={{ height: 1, backgroundColor: `${T.gold}15`, marginBottom: 24 }} />

              {/* Variant selector */}
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: T.muted, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  {t('size')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id
                    const isOutOfStock = variant.stock === 0
                    return (
                      <button key={variant.id}
                        onClick={() => { if (!isOutOfStock) { setSelectedVariant(variant); setQuantity(1) }}}
                        disabled={isOutOfStock}
                        style={{
                          padding: '8px 20px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12,
                          border: `1.5px solid ${isSelected ? T.gold : isOutOfStock ? `${T.muted}18` : `${T.espresso}15`}`,
                          backgroundColor: isSelected ? T.gold : 'transparent',
                          color: isSelected ? T.ivory : isOutOfStock ? `${T.muted}50` : T.espresso,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          textDecoration: isOutOfStock ? 'line-through' : 'none',
                          transition: 'all 0.2s',
                          opacity: isOutOfStock ? 0.45 : 1,
                        }}
                        onMouseEnter={e => { if (!isSelected && !isOutOfStock) e.currentTarget.style.borderColor = T.gold }}
                        onMouseLeave={e => { if (!isSelected && !isOutOfStock) e.currentTarget.style.borderColor = `${T.espresso}15` }}
                      >
                        {variant.size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quantity + Add to Cart side-by-side on desktop */}
              {selectedVariant && selectedVariant.stock > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: T.muted, fontWeight: 500 }}>
                      {t('quantity')}
                    </span>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: 34, height: 34, border: `1.5px solid ${T.espresso}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, color: T.espresso, transition: 'border-color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}
                      aria-label="Decrease quantity">
                      −
                    </button>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, width: 36, textAlign: 'center', color: T.espresso }}>{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      style={{ width: 34, height: 34, border: `1.5px solid ${T.espresso}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, color: T.espresso, transition: 'border-color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}15` }}
                      aria-label="Increase quantity">
                      +
                    </button>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: T.muted, fontWeight: 300 }}>
                      {t('max')}: {selectedVariant.stock}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                whileTap={(!selectedVariant || selectedVariant.stock === 0) ? undefined : { scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  border: 'none',
                  cursor: (!selectedVariant || selectedVariant.stock === 0) ? 'not-allowed' : 'pointer',
                  backgroundColor: addedToCart ? T.gold : (!selectedVariant || selectedVariant.stock === 0) ? `${T.muted}18` : T.espresso,
                  color: addedToCart ? T.espresso : (!selectedVariant || selectedVariant.stock === 0) ? `${T.muted}60` : T.ivory,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { if (!addedToCart && selectedVariant && selectedVariant.stock > 0) { e.currentTarget.style.backgroundColor = T.gold; e.currentTarget.style.color = T.espresso }}}
                onMouseLeave={e => { if (!addedToCart && selectedVariant && selectedVariant.stock > 0) { e.currentTarget.style.backgroundColor = T.espresso; e.currentTarget.style.color = T.ivory }}}
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Check style={{ width: 14, height: 14 }} />
                      {t('addedToCart')}
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <ShoppingBag style={{ width: 14, height: 14 }} />
                      {selectedVariant?.stock === 0 ? t('outOfStock') : t('addToCart')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Share */}
              <button onClick={handleShare}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '11px 24px',
                  border: `1px solid ${T.espresso}12`,
                  background: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 9,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  color: T.muted,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.espresso }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.espresso}12`; e.currentTarget.style.color = T.muted }}
              >
                <Share2 style={{ width: 12, height: 12 }} />
                {t('share')}
              </button>

              {/* Description */}
              {description && (
                <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.gold}15` }}>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: T.gold, marginBottom: 10, fontWeight: 500 }}>
                    {t('description')}
                  </h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: 1.8, color: `${T.ink}CC`, fontWeight: 300, maxWidth: '65ch' }}
                    dangerouslySetInnerHTML={{ __html: description }} />
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <div style={{ marginTop: 64, paddingTop: 36, borderTop: `1px solid ${T.gold}15` }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.3rem, 2.2vw, 1.6rem)', fontWeight: 300, color: T.espresso, marginBottom: 28 }}>
                {t('recommendations')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '0.875rem' }}>
                {product.relatedProducts.map((related: RelatedProduct) => {
                  const relT = related.translations.find(x => x.locale === locale) || related.translations.find(x => x.locale === 'fr')
                  const mainImg = related.images[0]
                  const relName = relT?.name || ''
                  return (
                    <a key={related.id} href={`/${locale}/products/${related.slug}`} className="group block">
                      <div className="relative overflow-hidden" style={{ width: '100%', aspectRatio: '3/4', backgroundColor: T.dust, marginBottom: 8 }}>
                        {mainImg ? (
                          <Image src={mainImg.url} alt={relName} fill className="object-contain"
                            style={{ padding: '0.75rem', transition: 'transform 0.5s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }} />
                        ) : (
                          <div className="flex items-center justify-center h-full" style={{ opacity: 0.2 }}>
                            <svg viewBox="0 0 120 280" fill="none" style={{ height: 100, width: 'auto' }}>
                              <rect x="44" y="8" width="32" height="16" rx="2.5" fill={T.muted} opacity="0.55"/>
                              <rect x="48" y="4" width="24" height="8" rx="2" fill={T.muted} opacity="0.65"/>
                              <path d="M47 24 L45 54 L75 54 L73 24Z" fill={T.muted} opacity="0.2"/>
                              <path d="M28 72 Q45 54 57 54 L63 54 Q75 54 92 72 L95 88 L25 88Z" fill={T.muted} opacity="0.2"/>
                              <rect x="25" y="88" width="70" height="162" rx="1" fill={T.muted} opacity="0.15"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: T.muted, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>{related.brand?.name || ''}</p>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.95rem', fontWeight: 400, color: T.espresso, marginBottom: 3, lineHeight: 1.15 }}>{relName}</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.espresso, fontWeight: 300 }}>
                        {related.promoPrice ? (
                          <>
                            <span style={{ color: T.gold }}>{Number(related.promoPrice).toFixed(2)} DA</span>
                            <span style={{ color: T.muted, textDecoration: 'line-through', fontSize: 9, marginInlineStart: 4 }}>{Number(related.minPrice).toFixed(2)} DA</span>
                          </>
                        ) : (
                          <span>{Number(related.minPrice).toFixed(2)} DA</span>
                        )}
                      </p>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  )
}