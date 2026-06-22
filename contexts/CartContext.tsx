"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Cart, CartItem, getCart, addToCart as addToCartUtil, updateCartItemQuantity, removeFromCart as removeFromCartUtil, clearCart as clearCartUtil } from '@/lib/cart'

interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getCart())
    setMounted(true)
  }, [])

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const updatedCart = addToCartUtil(item, quantity)
    setCart(updatedCart)
    setIsCartOpen(true) // Open cart drawer when item added
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantity(variantId, quantity)
    setCart(updatedCart)
  }

  const removeItem = (variantId: string) => {
    const updatedCart = removeFromCartUtil(variantId)
    setCart(updatedCart)
  }

  const clearCart = () => {
    const updatedCart = clearCartUtil()
    setCart(updatedCart)
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen(!isCartOpen)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
