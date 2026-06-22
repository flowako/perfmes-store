import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { requireAdmin } from '@/lib/auth-helpers'
import { productSchema } from '@/lib/validation'

// Helper function to generate a proper slug
function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return `product-${Date.now()}`
  }
  
  const slug = slugify(text, { 
    lower: true, 
    strict: true,
    remove: /[*+~.()'"!:@]/g 
  })
  
  return slug || `product-${Date.now()}`
}

/**
 * GET /api/admin/products
 * Description: Get all products for admin (including inactive)
 * Query params:
 * - search: search by name
 * - active: filter by active status
 * - page: page number
 * - limit: items per page (default 20)
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        {
          translations: {
            some: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
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

    if (active !== null && active !== undefined) {
      where.isActive = active === 'true'
    }

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          translations: true,
          brand: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          variants: {
            select: {
              id: true,
              size: true,
              stock: true,
            }
          },
          categories: {
            include: {
              category: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products,
      total,
      page,
      totalPages
    })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

/**
 * POST /api/admin/products
 * Description: Create new product
 * Body:
 * - nameFr: string
 * - nameAr: string
 * - descriptionFr: string
 * - descriptionAr: string
 * - brandId: string
 * - gender: 'MEN' | 'WOMEN' | 'UNISEX'
 * - categoryIds: string[]
 * - isFeatured: boolean
 * - isNewArrival: boolean
 * - isActive: boolean
 * - images: Array<{ url: string, altFr?: string, altAr?: string, order: number }>
 * - variants: Array<{ size: string, price: number, stock: number }>
 * Requires: Admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const body = await request.json()
    
    // Validate body
    const validatedData = productSchema.parse(body)

    console.log('Creating product with French name:', validatedData.nameFr)

    // Generate unique slug
    let slug = generateSlug(validatedData.nameFr)
    console.log('Generated initial slug:', slug)
    
    let slugExists = await prisma.product.findUnique({ where: { slug } })
    let counter = 1
    
    while (slugExists) {
      slug = `${generateSlug(validatedData.nameFr)}-${counter}`
      slugExists = await prisma.product.findUnique({ where: { slug } })
      counter++
    }
    
    console.log('Final slug:', slug)

    // Create product with transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          slug,
          brandId: validatedData.brandId,
          gender: validatedData.gender,
          isFeatured: validatedData.isFeatured,
          isNewArrival: validatedData.isNewArrival,
          isActive: validatedData.isActive,
          translations: {
            create: [
              {
                locale: 'fr',
                name: validatedData.nameFr,
                description: validatedData.descriptionFr,
              },
              {
                locale: 'ar',
                name: validatedData.nameAr,
                description: validatedData.descriptionAr,
              }
            ]
          },
          images: {
            create: validatedData.images.map(img => ({
              url: img.url,
              altFr: img.altFr,
              altAr: img.altAr,
              order: img.order,
            }))
          },
          variants: {
            create: validatedData.variants.map(v => ({
              size: v.size,
              price: v.price,
              stock: v.stock,
            }))
          },
          categories: {
            create: validatedData.categoryIds.map(catId => ({
              categoryId: catId,
            }))
          }
        },
        include: {
          translations: true,
          brand: true,
          images: true,
          variants: true,
          categories: {
            include: {
              category: true,
            }
          }
        }
      })

      return newProduct
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
