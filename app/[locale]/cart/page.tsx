"use client"

import { useCart } from '@/contexts/CartContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'

export default function CartPage() {
  const router = useRouter()
  const locale = useLocale()
  const { cart, updateQuantity, removeItem } = useCart()
  const t = useTranslations('cart')

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      <main className="pt-28 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-12 text-charcoal">{t('title')}</h1>

          {cart.items.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-muted/30 mx-auto mb-4" strokeWidth={1} />
              <h2 className="font-heading text-2xl mb-4 text-charcoal">{t('empty')}</h2>
              <button
                onClick={() => router.push(`/${locale}/products/men`)}
                className="px-8 py-3 bg-charcoal text-cream hover:bg-gold transition-colors text-xs tracking-wider uppercase"
              >
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-8">
                <div className="bg-white divide-y divide-charcoal/10">
                  {cart.items.map((item) => (
                    <div key={item.variantId} className="p-6 flex gap-6">
                      {/* Image */}
                      <div className="relative w-24 h-32 bg-cream flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <p className="font-body text-xs text-muted mb-1">{item.brandName}</p>
                        <h3 className="font-body text-lg text-charcoal mb-1">{item.productName}</h3>
                        <p className="font-body text-sm text-muted mb-4">{item.variantSize}</p>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="font-body text-base text-charcoal font-medium">
                            {Number(item.price).toFixed(2)} DA
                          </span>
                          {Number(item.price) < Number(item.originalPrice) && (
                            <span className="font-body text-sm text-muted line-through">
                              {Number(item.originalPrice).toFixed(2)} DA
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="w-8 h-8 border border-charcoal/20 flex items-center justify-center hover:border-gold transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-body text-base w-10 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, Math.min(item.maxStock, item.quantity + 1))}
                              disabled={item.quantity >= item.maxStock}
                              className="w-8 h-8 border border-charcoal/20 flex items-center justify-center hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="ml-auto p-2 text-muted hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-heading text-xl text-charcoal">
                          {(Number(item.price) * item.quantity).toFixed(2)} DA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4">
                <div className="bg-white p-6 sticky top-28">
                  <h2 className="font-heading text-xl mb-6 text-charcoal">{t('title')}</h2>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b border-charcoal/10">
                    <div className="flex items-center justify-between font-body text-sm">
                      <span className="text-muted">{t('subtotal')}</span>
                      <span className="text-charcoal">{Number(cart.total).toFixed(2)} DA</span>
                    </div>
                    <div className="flex items-center justify-between font-body text-sm">
                      <span className="text-muted">{t('shipping')}</span>
                      <span className="text-charcoal">{t('shippingCalculated')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-heading text-2xl mb-6">
                    <span className="text-charcoal">{t('total')}</span>
                    <span className="text-gold">{Number(cart.total).toFixed(2)} DA</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-charcoal text-cream font-body text-xs tracking-wider uppercase hover:bg-gold transition-colors"
                  >
                    {t('checkout')}
                  </button>

                  <button
                    onClick={() => router.push(`/${locale}/products/men`)}
                    className="w-full mt-3 py-3 border-2 border-charcoal/20 font-body text-xs tracking-wider uppercase hover:border-gold transition-colors"
                  >
                    {t('continueShopping')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
