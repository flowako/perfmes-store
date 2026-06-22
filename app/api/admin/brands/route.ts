import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { requireAdmin } from '@/lib/auth-helpers'
import { brandCategorySchema } from '@/lib/validation'

/**
 * GET /api/admin/brands
 * Description: Get all brands for admin management
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

/**
 * POST /api/admin/brands
 * Description: Create new brand
 * Body:
 * - name: string
 * Requires: Admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const body = await request.json()
    
    // Validate
    const { name } = brandCategorySchema.parse(body)

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true })
    let slugExists = await prisma.brand.findUnique({ where: { slug } })
    let counter = 1
    
    while (slugExists) {
      slug = `${slugify(name, { lower: true, strict: true })}-${counter}`
      slugExists = await prisma.brand.findUnique({ where: { slug } })
      counter++
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
      }
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
