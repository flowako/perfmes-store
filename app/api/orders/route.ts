import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkoutSchema } from '@/lib/validation'
import { isPromotionActive } from '@/lib/promotions'

/**
 * POST /api/orders
 * Description: Create new order (checkout submission)
 * Body:
 * - fullName: string
 * - phone: string (Algerian format: 0[5-7][0-9]{8})
 * - wilaya: string
 * - commune: string
 * - address: string
 * - notes?: string
 * - items: Array<{ variantId: string, quantity: number }>
 * 
 * Logic:
 * 1. Validate all fields
 * 2. Re-validate variant prices from DB (prevent client manipulation)
 * 3. Check stock availability for all items
 * 4. Create order with PENDING status
 * 5. Decrement stock for each variant
 * 6. Return order reference number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = checkoutSchema.parse(body)

    // Fetch all variants and verify they exist
    const variantIds = validatedData.items.map(item => item.variantId)
    const variants = await prisma.variant.findMany({
      where: {
        id: { in: variantIds },
        product: {
          isActive: true,
        }
      },
      include: {
        promotionVariants: {
          include: {
            promotion: true
          }
        },
        product: {
          include: {
            translations: {
              where: { locale: { in: ['fr', 'ar'] } }
            },
            brand: true,
          }
        }
      }
    })

    // Verify all variants exist
    if (variants.length !== validatedData.items.length) {
      return NextResponse.json({ 
        error: 'Certains produits ne sont plus disponibles' 
      }, { status: 400 })
    }

    // Build order items and calculate total
    const orderItems: any[] = []
    let orderTotal = 0

    for (const item of validatedData.items) {
      const variant = variants.find(v => v.id === item.variantId)
      if (!variant) continue

      // Check stock
      if (variant.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour ${variant.product.translations.find(t => t.locale === 'fr')?.name || 'ce produit'}` 
        }, { status: 400 })
      }

      // Calculate price (with promotion if active)
      // Find active promotion for this variant
      const activePromotion = variant.promotionVariants
        .map(pv => pv.promotion)
        .find(promo => promo && isPromotionActive(promo))
      
      const unitPrice = (activePromotion && activePromotion.discountedPrice !== null)
        ? parseFloat(activePromotion.discountedPrice.toString())
        : parseFloat(variant.price.toString())

      const itemTotal = unitPrice * item.quantity
      orderTotal += itemTotal

      // Get translations
      const frTranslation = variant.product.translations.find(t => t.locale === 'fr')
      const arTranslation = variant.product.translations.find(t => t.locale === 'ar')

      orderItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice,
        productNameFr: frTranslation?.name || 'Produit',
        productNameAr: arTranslation?.name || 'منتج',
        brandNameFr: variant.product.brand.name, // Brand name (assuming single language in schema)
        brandNameAr: variant.product.brand.name, // Brand name (assuming single language in schema)
        variantSize: variant.size,
      })
    }

    // Generate unique order reference
    const reference = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Create order in transaction (order + items + stock decrement)
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          reference,
          fullName: validatedData.fullName,
          phone: validatedData.phone,
          wilaya: validatedData.wilaya,
          commune: validatedData.commune,
          address: validatedData.address,
          notes: validatedData.notes,
          total: orderTotal,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          items: true,
        }
      })

      // Decrement stock for each item
      for (const item of validatedData.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    return NextResponse.json({ 
      reference: order.reference,
      orderId: order.id,
      success: true 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: error 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
  }
}

/**
 * GET /api/orders/[reference]
 * Description: Fetch order details by reference number
 * Used for order confirmation page
 */
export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference')
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }
    
    const order = await prisma.order.findUnique({
      where: { reference },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: true,
                    brand: true,
                    images: {
                      orderBy: { order: 'asc' },
                      take: 1,
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
