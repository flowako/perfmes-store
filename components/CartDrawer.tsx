"use client"

import { useCart } from '@/contexts/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/10">
              <h2 className="font-heading text-xl text-charcoal">Your Selection</h2>
              <button
                onClick={closeCart}
                className="p-2 text-muted hover:text-charcoal transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted/30 mb-4" strokeWidth={1} />
                  <p className="font-body text-sm text-muted mb-2">Your cart is empty</p>
                  <p className="font-body text-xs text-muted/60">Add some fragrances to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-24 h-28 bg-cream flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs text-muted mb-1">{item.brandName}</p>
                        <h3 className="font-body text-sm text-charcoal mb-1 truncate">
                          {item.productName}
                        </h3>
                        <p className="font-body text-xs text-muted mb-3">{item.variantSize}</p>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-body text-sm text-charcoal">
                            {Number(item.price).toFixed(2)} DA
                          </span>
                          {Number(item.price) < Number(item.originalPrice) && (
                            <span className="font-body text-xs text-muted line-through">
                              {Number(item.originalPrice).toFixed(2)} DA
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-7 h-7 border border-charcoal/20 flex items-center justify-center hover:border-gold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-body text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, Math.min(item.maxStock, item.quantity + 1))}
                            disabled={item.quantity >= item.maxStock}
                            className="w-7 h-7 border border-charcoal/20 flex items-center justify-center hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="ml-auto p-2 text-muted hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-charcoal/10 px-6 py-6">
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-body text-sm text-muted">Subtotal</span>
                  <span className="font-heading text-2xl text-charcoal">
                    {Number(cart.total).toFixed(2)} DA
                  </span>
                </div>

                <p className="font-body text-xs text-muted/60 mb-6 text-center">
                  Livraison calculée à la caisse
                </p>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-charcoal text-cream font-body text-xs tracking-wider uppercase hover:bg-gold transition-colors"
                >
                  Passer la commande
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full mt-3 py-3 border-2 border-charcoal/20 font-body text-xs tracking-wider uppercase hover:border-gold transition-colors"
                >
                  Continuer les achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
