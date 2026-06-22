import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/products/[slug]
 * Description: Get single product by slug for product detail page
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params

    console.log('Fetching product with slug:', slug)

    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        translations: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variants: {
          include: {
            promotionVariants: {
              where: {
                promotion: {
                  isActive: true,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                }
              },
              include: {
                promotion: true
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      }
    })

    if (!product) {
      console.log('Product not found with slug:', slug)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('Product found:', product.id, product.slug)

    // Transform variants with promotion info
    const transformedVariants = product.variants.map(v => {
      const hasPromotion = v.promotionVariants && v.promotionVariants.length > 0
      const promotion = hasPromotion ? v.promotionVariants[0].promotion : null
      const originalPrice = parseFloat(v.price.toString())
      
      let effectivePrice = originalPrice
      if (promotion) {
        // Use discountedPrice if available, otherwise calculate from discountType/discountValue
        if (promotion.discountedPrice) {
          effectivePrice = parseFloat(promotion.discountedPrice.toString())
        } else if (promotion.discountType === 'percentage') {
          effectivePrice = originalPrice * (1 - parseFloat(promotion.discountValue.toString()) / 100)
        } else {
          effectivePrice = originalPrice - parseFloat(promotion.discountValue.toString())
        }
      }
      
      return {
        id: v.id,
        size: v.size,
        price: originalPrice,
        stock: v.stock,
        effectivePrice,
        originalPrice,
        hasPromotion,
        promotion: promotion ? {
          name: promotion.name,
          endDate: promotion.endDate.toISOString(),
        } : null,
      }
    })

    // Fetch related products (same brand or category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        OR: [
          { brandId: product.brandId },
          {
            categories: {
              some: {
                categoryId: {
                  in: product.categories.map(pc => pc.categoryId)
                }
              }
            }
          }
        ]
      },
      take: 4,
      include: {
        translations: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        variants: {
          include: {
            promotionVariants: {
              where: {
                promotion: {
                  isActive: true,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                }
              },
              include: {
                promotion: true
              }
            }
          }
        }
      }
    })

    const transformedRelated = relatedProducts.map(p => {
      const minPrice = Math.min(...p.variants.map(v => parseFloat(v.price.toString())))
      const hasPromo = p.variants.some(v => v.promotionVariants && v.promotionVariants.length > 0)
      
      let promoPrice = null
      if (hasPromo) {
        promoPrice = Math.min(...p.variants
          .filter(v => v.promotionVariants && v.promotionVariants.length > 0)
          .map(v => {
            const promotion = v.promotionVariants[0].promotion
            const originalPrice = parseFloat(v.price.toString())
            // Use discountedPrice if available, otherwise calculate
            if (promotion.discountedPrice) {
              return parseFloat(promotion.discountedPrice.toString())
            } else if (promotion.discountType === 'percentage') {
              return originalPrice * (1 - parseFloat(promotion.discountValue.toString()) / 100)
            } else {
              return originalPrice - parseFloat(promotion.discountValue.toString())
            }
          }))
      }

      return {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        translations: p.translations,
        images: p.images,
        minPrice,
        promoPrice,
      }
    })

    // Transform data for frontend
    const transformedProduct = {
      id: product.id,
      slug: product.slug,
      gender: product.gender,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      },
      translations: product.translations.map(t => ({
        locale: t.locale,
        name: t.name,
        description: t.description,
      })),
      categories: product.categories.map(pc => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      images: product.images.map((img, index) => ({
        id: img.id,
        url: img.url,
        altFr: img.altFr || product.translations.find(t => t.locale === 'fr')?.name || '',
        altAr: img.altAr || product.translations.find(t => t.locale === 'ar')?.name || '',
        order: index,
      })),
      variants: transformedVariants,
      relatedProducts: transformedRelated,
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
