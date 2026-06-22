import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/search
 * Description: Full-text search for products
 * Query params:
 * - q: search query
 * - locale: 'ar' | 'fr'
 * - limit: number (default 20)
 * 
 * Searches: product names in both Arabic and French
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const locale = (searchParams.get('locale') || 'fr') as 'ar' | 'fr'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        results: [],
        query 
      })
    }

    // Search in product names and brand names
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            translations: {
              some: {
                name: { contains: query, mode: 'insensitive' }
              }
            }
          },
          {
            brand: {
              name: { contains: query, mode: 'insensitive' }
            }
          }
        ]
      },
      take: limit,
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
      }
    })

    return NextResponse.json({ 
      results: products,
      query 
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
