import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { requireAdmin } from '@/lib/auth-helpers'

/**
 * GET /api/admin/categories/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/categories/[id]
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
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate new slug
    let slug = slugify(name, { lower: true, strict: true })
    
    // Check if slug exists (excluding current category)
    let slugExists = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    })
    
    let counter = 1
    while (slugExists) {
      slug = `${slugify(name, { lower: true, strict: true })}-${counter}`
      slugExists = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      })
      counter++
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/categories/[id]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params

    // Check if category has products
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!categoryWithProducts) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (categoryWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${categoryWithProducts._count.products} products. Please reassign or delete products first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
