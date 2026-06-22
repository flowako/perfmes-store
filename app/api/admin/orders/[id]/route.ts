import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { orderStatusSchema } from '@/lib/validation'

/**
 * GET /api/admin/orders/[id]
 * Description: Get full order details
 * Requires: Admin authentication
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('[API Orders GET] Request received')
  
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) {
      console.log('[API Orders GET] Auth failed')
      return auth.response
    }

    console.log('[API Orders GET] Auth passed, unwrapping params...')
    const { id } = await context.params
    console.log('[API Orders GET] Order ID:', id)
    
    console.log('[API Orders GET] Querying database...')
    const order = await prisma.order.findUnique({
      where: { id },
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
      console.log('[API Orders GET] Order not found in database')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('[API Orders GET] Order found:', order.id, order.reference)
    return NextResponse.json({ order })
  } catch (error) {
    console.error('[API Orders GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Description: Update order status
 * Body:
 * - status: OrderStatus
 * Requires: Admin authentication
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params
    const body = await request.json()
    
    // Validate status
    const { status } = orderStatusSchema.parse(body)

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: true,
                    brand: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
