import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { requireAdmin } from '@/lib/auth-helpers'
import { brandCategorySchema } from '@/lib/validation'

/**
 * GET /api/admin/categories
 * Description: Get all categories for admin management
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

/**
 * POST /api/admin/categories
 * Description: Create new category
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
    let slugExists = await prisma.category.findUnique({ where: { slug } })
    let counter = 1
    
    while (slugExists) {
      slug = `${slugify(name, { lower: true, strict: true })}-${counter}`
      slugExists = await prisma.category.findUnique({ where: { slug } })
      counter++
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
