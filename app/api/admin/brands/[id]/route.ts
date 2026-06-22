import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { requireAdmin } from '@/lib/auth-helpers'

/**
 * GET /api/admin/brands/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/brands/[id]
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
    
    // Check if slug exists (excluding current brand)
    let slugExists = await prisma.brand.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    })
    
    let counter = 1
    while (slugExists) {
      slug = `${slugify(name, { lower: true, strict: true })}-${counter}`
      slugExists = await prisma.brand.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      })
      counter++
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: { name, slug }
    })

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/brands/[id]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const { id } = await context.params

    // Check if brand has products
    const brandWithProducts = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!brandWithProducts) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    if (brandWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete brand with ${brandWithProducts._count.products} products. Please reassign or delete products first.` },
        { status: 400 }
      )
    }

    await prisma.brand.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
