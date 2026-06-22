import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

/**
 * GET /api/admin/variants
 * Description: Get all variants with product info
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const variants = await prisma.variant.findMany({
      include: {
        product: {
          include: {
            translations: {
              where: { locale: 'fr' }
            },
            brand: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1
            }
          }
        },
        promotionVariants: {
          include: {
            promotion: true
          }
        }
      },
      orderBy: {
        product: {
          createdAt: 'desc'
        }
      }
    })

    // Format variants with product name
    const formattedVariants = variants.map(variant => {
      const activePromotion = variant.promotionVariants.length > 0 
        ? variant.promotionVariants[0].promotion 
        : null
      
      return {
        id: variant.id,
        productName: variant.product.translations[0]?.name || 'Unnamed Product',
        brandName: variant.product.brand?.name || 'No Brand',
        size: variant.size,
        price: Number(variant.price),
        stock: variant.stock,
        imageUrl: variant.product.images[0]?.url || null,
        hasPromotion: !!activePromotion,
        promotionName: activePromotion?.name || null,
        productSlug: variant.product.slug,
        gender: variant.product.gender,
        isFeatured: variant.product.isFeatured,
        isNewArrival: variant.product.isNewArrival
      }
    })

    return NextResponse.json({ variants: formattedVariants })
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 })
  }
}
