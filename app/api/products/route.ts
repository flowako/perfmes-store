import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/products
 * Description: Get active products for public display
 * Query params:
 * - search: search by name, brand, description
 * - brand: filter by brand slug
 * - category: filter by category slug
 * - gender: filter by gender (MEN, WOMEN, UNISEX)
 * - minPrice: minimum price filter
 * - maxPrice: maximum price filter
 * - onSale: filter products with active promotions
 * - inStock: filter products with stock
 * - sort: sorting option (newest, price-asc, price-desc, promo-first)
 * - page: page number (default 1)
 * - limit: items per page (default 100 for infinite scroll)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const brandSlugs = searchParams.getAll('brand') // Changed to support multiple brands
    const categorySlugs = searchParams.getAll('category') // Changed to support multiple categories
    const genders = searchParams.getAll('gender') // Changed to support multiple genders
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const onSale = searchParams.get('onSale') === 'true'
    const inStock = searchParams.get('inStock') === 'true'
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          translations: {
            some: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ]
            }
          }
        },
        {
          brand: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    // Brand filter - support multiple brands
    if (brandSlugs.length > 0) {
      where.brand = {
        slug: { in: brandSlugs }
      }
    }

    // Category filter - support multiple categories
    if (categorySlugs.length > 0) {
      where.categories = {
        some: {
          category: {
            slug: { in: categorySlugs }
          }
        }
      }
    }

    // Gender filter - support multiple genders
    if (genders.length > 0) {
      const validGenders = genders.filter(g => ['MEN', 'WOMEN', 'UNISEX'].includes(g));
      if (validGenders.length > 0) {
        where.gender = { in: validGenders };
      }
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
          ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
        }
      }
    }

    // Stock filter
    if (inStock) {
      where.variants = {
        some: {
          stock: { gt: 0 }
        }
      }
    }

    // Promotion filter
    if (onSale) {
      where.variants = {
        some: {
          promotionVariants: {
            some: {
              promotion: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              }
            }
          }
        }
      }
    }

    // Sorting
    let orderBy: any = {}
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'price-asc':
        // Will need to sort in-memory since we need min variant price
        orderBy = { createdAt: 'desc' }
        break
      case 'price-desc':
        orderBy = { createdAt: 'desc' }
        break
      case 'promo-first':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy,
      }),
      prisma.product.count({ where })
    ])

    // Transform data for frontend
    const transformedProducts = products.map(product => {
      const frTranslation = product.translations.find(t => t.locale === 'fr')
      const arTranslation = product.translations.find(t => t.locale === 'ar')
      
      // Get min price and check if on sale
      const minPrice = Math.min(...product.variants.map(v => parseFloat(v.price.toString())))
      
      // Check if any variant has an active promotion
      const hasPromotion = product.variants.some(v => 
        v.promotionVariants && v.promotionVariants.length > 0
      )
      
      // Calculate min promotion price
      const minPromotionPrice = hasPromotion
        ? Math.min(...product.variants
            .filter(v => v.promotionVariants && v.promotionVariants.length > 0)
            .map(v => {
              const promotion = v.promotionVariants[0].promotion
              const originalPrice = parseFloat(v.price.toString())
              // Use discountedPrice if available, otherwise calculate from discountType/discountValue
              if (promotion.discountedPrice) {
                return parseFloat(promotion.discountedPrice.toString())
              } else if (promotion.discountType === 'percentage') {
                return originalPrice * (1 - parseFloat(promotion.discountValue.toString()) / 100)
              } else {
                return originalPrice - parseFloat(promotion.discountValue.toString())
              }
            }))
        : null

      return {
        id: product.id,
        slug: product.slug,
        name: frTranslation?.name || '',
        nameAr: arTranslation?.name || '',
        description: frTranslation?.description || '',
        descriptionAr: arTranslation?.description || '',
        brand: product.brand.name,
        brandSlug: product.brand.slug,
        gender: product.gender,
        price: minPrice,
        salePrice: minPromotionPrice,
        isOnSale: hasPromotion,
        isNewArrival: product.isNewArrival,
        isFeatured: product.isFeatured,
        images: product.images.map(img => ({
          url: img.url,
          altFr: img.altFr,
          altAr: img.altAr,
        })),
        categories: product.categories.map(pc => ({
          name: pc.category.name,
          slug: pc.category.slug,
        })),
        variants: product.variants.map(v => {
          const originalPrice = parseFloat(v.price.toString())
          let salePrice = null
          
          if (v.promotionVariants && v.promotionVariants.length > 0) {
            const promotion = v.promotionVariants[0].promotion
            // Use discountedPrice if available, otherwise calculate
            if (promotion.discountedPrice) {
              salePrice = parseFloat(promotion.discountedPrice.toString())
            } else if (promotion.discountType === 'percentage') {
              salePrice = originalPrice * (1 - parseFloat(promotion.discountValue.toString()) / 100)
            } else {
              salePrice = originalPrice - parseFloat(promotion.discountValue.toString())
            }
          }
          
          return {
            id: v.id,
            size: v.size,
            price: originalPrice,
            stock: v.stock,
            salePrice,
          }
        }),
        stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      }
    })

    // Apply in-memory sorting for price-based sorts
    if (sort === 'price-asc') {
      transformedProducts.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      transformedProducts.sort((a, b) => b.price - a.price)
    } else if (sort === 'promo-first') {
      transformedProducts.sort((a, b) => (b.isOnSale ? 1 : 0) - (a.isOnSale ? 1 : 0))
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
