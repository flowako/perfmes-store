import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

/**
 * GET /api/admin/promotions/[id]
 * Description: Get single promotion by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params

    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        promotionVariants: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    translations: {
                      where: { locale: 'fr' }
                    },
                    brand: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error('Error fetching promotion:', error)
    return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/promotions/[id]
 * Description: Update promotion
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params
    const body = await request.json()
    const { name, discountType, discountValue, startDate, endDate, isActive, variantIds } = body

    // Convert date strings to datetime with time set to start/end of day
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const promotion = await prisma.$transaction(async (tx) => {
      // Remove all existing variant links via junction table
      await tx.promotionVariant.deleteMany({
        where: { promotionId: id }
      })

      // Update promotion
      const updated = await tx.promotion.update({
        where: { id },
        data: {
          name,
          discountType: discountType || 'percentage',
          discountValue,
          discountedPrice: null, // Will be calculated per variant on the frontend
          startDate: start,
          endDate: end,
          isActive,
        }
      })

      // Link new variants via junction table
      if (variantIds && variantIds.length > 0) {
        await tx.promotionVariant.createMany({
          data: variantIds.map((variantId: string) => ({
            promotionId: updated.id,
            variantId,
          }))
        })
      }

      return await tx.promotion.findUnique({
        where: { id: updated.id },
        include: {
          promotionVariants: {
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
    })

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/promotions/[id]
 * Description: Delete promotion (cascade deletes PromotionVariant entries automatically)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params

    // Delete promotion (cascade will remove PromotionVariant entries)
    await prisma.promotion.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}
