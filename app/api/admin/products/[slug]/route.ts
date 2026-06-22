import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { productSchema } from '@/lib/validation'
import slugify from 'slugify'

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
 * GET /api/admin/products/[slug]
 * Description: Get single product with all details for editing
 * Requires: Admin authentication
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { slug } = await context.params
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' }
        },
        variants: {
          include: {
            promotionVariants: {
              include: {
                promotion: true
              }
            }
          }
        },
        categories: {
          include: {
            category: true,
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/products/[slug]
 * Description: Update existing product
 * Body: Same as POST /api/admin/products
 * Requires: Admin authentication
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { slug: currentSlug } = await context.params
    const body = await request.json()
    
    // Validate body
    const validatedData = productSchema.parse(body)

    // Update product with transaction
    const product = await prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.product.findUnique({
        where: { slug: currentSlug },
        include: {
          images: true,
          variants: true,
          translations: true,
        }
      })

      if (!existingProduct) {
        throw new Error('Product not found')
      }

      // Get existing French name
      const existingFrTranslation = existingProduct.translations.find(t => t.locale === 'fr')
      const existingFrName = existingFrTranslation?.name || ''

      // Update slug if French name changed
      let slug = existingProduct.slug
      if (body.nameFr !== existingFrName) {
        slug = generateSlug(validatedData.nameFr)
        let slugExists = await tx.product.findFirst({
          where: { slug, NOT: { id: existingProduct.id } }
        })
        let counter = 1
        
        while (slugExists) {
          slug = `${generateSlug(validatedData.nameFr)}-${counter}`
          slugExists = await tx.product.findFirst({
            where: { slug, NOT: { id: existingProduct.id } }
          })
          counter++
        }
      }

      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: existingProduct.id },
        data: {
          slug,
          brandId: validatedData.brandId,
          gender: validatedData.gender,
          isFeatured: validatedData.isFeatured,
          isNewArrival: validatedData.isNewArrival,
          isActive: validatedData.isActive,
        }
      })

      // Update translations
      await tx.productTranslation.deleteMany({
        where: { productId: existingProduct.id }
      })
      
      await tx.productTranslation.createMany({
        data: [
          {
            productId: existingProduct.id,
            locale: 'fr',
            name: validatedData.nameFr,
            description: validatedData.descriptionFr,
          },
          {
            productId: existingProduct.id,
            locale: 'ar',
            name: validatedData.nameAr,
            description: validatedData.descriptionAr,
          }
        ]
      })

      // Update images - delete all and recreate
      await tx.productImage.deleteMany({
        where: { productId: existingProduct.id }
      })
      
      await tx.productImage.createMany({
        data: validatedData.images.map(img => ({
          productId: existingProduct.id,
          url: img.url,
          altFr: img.altFr,
          altAr: img.altAr,
          order: img.order,
        }))
      })

      // Update variants - delete all and recreate (simpler than diff)
      await tx.variant.deleteMany({
        where: { productId: existingProduct.id }
      })
      
      await tx.variant.createMany({
        data: validatedData.variants.map(v => ({
          productId: existingProduct.id,
          size: v.size,
          price: v.price,
          stock: v.stock,
        }))
      })

      // Update categories
      await tx.productCategory.deleteMany({
        where: { productId: existingProduct.id }
      })
      
      await tx.productCategory.createMany({
        data: validatedData.categoryIds.map(catId => ({
          productId: existingProduct.id,
          categoryId: catId,
        }))
      })

      // Return updated product with relations
      return await tx.product.findUnique({
        where: { id: existingProduct.id },
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
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/products/[slug]
 * Description: Delete product (soft delete by setting isActive = false recommended)
 * Requires: Admin authentication
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { slug } = await context.params
    
    // Soft delete - set isActive to false
    const product = await prisma.product.update({
      where: { slug },
      data: {
        isActive: false,
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
