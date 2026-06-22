import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { promotionSchema } from '@/lib/validation'

/**
 * GET /api/admin/promotions
 * Description: Get all promotions
 * Query params:
 * - active: filter by active status
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const searchParams = request.nextUrl.searchParams
    const active = searchParams.get('active')

    const where: any = {}
    
    if (active !== null && active !== undefined) {
      where.isActive = active === 'true'
    }

    const promotions = await prisma.promotion.findMany({
      where,
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
      },
      orderBy: {
        endDate: 'desc'
      }
    })

    // Add variant count to each promotion
    const promotionsWithCount = promotions.map(promo => ({
      ...promo,
      variantCount: promo.promotionVariants.length,
    }))

    return NextResponse.json({ promotions: promotionsWithCount })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

/**
 * POST /api/admin/promotions
 * Description: Create new promotion
 * Body:
 * - name: string
 * - discountType: 'percentage' | 'fixed'
 * - discountValue: number (percentage or fixed amount)
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - isActive: boolean
 * - variantIds: string[] (variants to apply promotion to)
 * 
 * Note: discountedPrice is calculated automatically based on discountType and discountValue
 * For percentage: discountedPrice = originalPrice * (1 - discountValue/100)
 * For fixed: discountedPrice = originalPrice - discountValue
 * 
 * Requires: Admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const body = await request.json()
    
    // Validate body
    const validatedData = promotionSchema.parse(body)

    // Convert date strings to datetime with time set to start/end of day
    const startDate = new Date(validatedData.startDate)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(validatedData.endDate)
    endDate.setHours(23, 59, 59, 999)

    // Create promotion and link variants via junction table
    const promotion = await prisma.$transaction(async (tx) => {
      const newPromotion = await tx.promotion.create({
        data: {
          name: validatedData.name,
          discountType: validatedData.discountType,
          discountValue: validatedData.discountValue,
          discountedPrice: null, // Will be calculated per variant on the frontend
          startDate,
          endDate,
          isActive: validatedData.isActive,
        }
      })

      // Link variants to promotion via PromotionVariant junction table
      if (validatedData.variantIds && validatedData.variantIds.length > 0) {
        await tx.promotionVariant.createMany({
          data: validatedData.variantIds.map(variantId => ({
            promotionId: newPromotion.id,
            variantId,
          }))
        })
      }

      return await tx.promotion.findUnique({
        where: { id: newPromotion.id },
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

    return NextResponse.json({ promotion }, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}
