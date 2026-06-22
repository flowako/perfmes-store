import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isPromotionActive } from '@/lib/promotions'

/**
 * GET /api/featured
 * Description: Get featured products for homepage
 * Returns products where isFeatured = true
 * Limit: 6 products
 */
export async function GET(request: NextRequest) {
  try {
    const locale = (request.nextUrl.searchParams.get('locale') || 'fr') as 'ar' | 'fr'
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 6,
      include: {
        translations: {
          where: { locale }
        },
        brand: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        variants: {
          include: {
            promotionVariants: {
              include: {
                promotion: true
              }
            }
          },
          orderBy: { price: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Process products to add computed fields
    const processedProducts = products.map(product => {
      const activePromotions = product.variants
        .filter(v => v.promotionVariants.length > 0 && isPromotionActive(v.promotionVariants[0].promotion))
      
      const hasPromotion = activePromotions.length > 0
      const minPrice = Math.min(...product.variants.map(v => parseFloat(v.price.toString())))
      const promoPrice = hasPromotion 
        ? Math.min(...activePromotions.map(v => {
            const dp = v.promotionVariants[0].promotion.discountedPrice;
            return dp ? parseFloat(dp.toString()) : 0;
          }))
        : null

      return {
        ...product,
        hasPromotion,
        minPrice,
        promoPrice,
        totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      }
    })

    return NextResponse.json({ products: processedProducts })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 })
  }
}
