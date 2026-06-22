/**
 * Cart management utilities using localStorage
 * No server-side cart - fully client-side
 */

export interface CartItem {
  variantId: string
  productId: string
  productName: string  // Store FR name by default
  productNameAr?: string  // Store AR name for orders
  productSlug: string
  brandName: string
  variantSize: string
  price: number  // Current price (with promotion if applicable)
  originalPrice: number  // Original price before promotion
  quantity: number
  imageUrl: string
  maxStock: number  // Available stock for this variant
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

const CART_STORAGE_KEY = 'maison-elara-cart'

/**
 * Get cart from localStorage
 */
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 }
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) {
      return { items: [], total: 0, itemCount: 0 }
    }

    const cart: Cart = JSON.parse(stored)
    return cart
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return { items: [], total: 0, itemCount: 0 }
  }
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return { total, itemCount }
}

/**
 * Add item to cart
 */
export function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1): Cart {
  const cart = getCart()
  
  // Check if item already exists
  const existingIndex = cart.items.findIndex(i => i.variantId === item.variantId)
  
  if (existingIndex >= 0) {
    // Update quantity, respecting max stock
    const existing = cart.items[existingIndex]
    const newQuantity = Math.min(existing.quantity + quantity, existing.maxStock)
    cart.items[existingIndex].quantity = newQuantity
  } else {
    // Add new item
    const newQuantity = Math.min(quantity, item.maxStock)
    cart.items.push({ ...item, quantity: newQuantity })
  }
  
  // Recalculate totals
  const totals = calculateCartTotals(cart.items)
  cart.total = totals.total
  cart.itemCount = totals.itemCount
  
  saveCart(cart)
  return cart
}

/**
 * Update item quantity
 */
export function updateCartItemQuantity(variantId: string, quantity: number): Cart {
  const cart = getCart()
  const itemIndex = cart.items.findIndex(i => i.variantId === variantId)
  
  if (itemIndex >= 0) {
    const item = cart.items[itemIndex]
    
    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1)
    } else {
      // Update quantity, respecting max stock
      cart.items[itemIndex].quantity = Math.min(quantity, item.maxStock)
    }
    
    // Recalculate totals
    const totals = calculateCartTotals(cart.items)
    cart.total = totals.total
    cart.itemCount = totals.itemCount
    
    saveCart(cart)
  }
  
  return cart
}

/**
 * Remove item from cart
 */
export function removeFromCart(variantId: string): Cart {
  return updateCartItemQuantity(variantId, 0)
}

/**
 * Clear entire cart
 */
export function clearCart(): Cart {
  const emptyCart: Cart = { items: [], total: 0, itemCount: 0 }
  saveCart(emptyCart)
  return emptyCart
}

/**
 * Get item count (for badge display)
 */
export function getCartItemCount(): number {
  const cart = getCart()
  return cart.itemCount
}
