import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns'

/**
 * GET /api/admin/dashboard
 * Description: Get dashboard statistics
 * Returns:
 * - todayOrders: { count: number, total: Decimal }
 * - weekOrders: { count: number, total: Decimal }
 * - monthOrders: { count: number, total: Decimal }
 * - pendingOrdersCount: number
 * - lowStockVariants: Array<{ variant with product info, stock }>
 * - recentOrders: Array<last 10 orders>
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const now = new Date()
    const todayStart = startOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const monthStart = startOfMonth(now)

    // Fetch all statistics in parallel
    const [
      todayOrdersData,
      weekOrdersData,
      monthOrdersData,
      pendingOrdersCount,
      lowStockVariants,
      recentOrders
    ] = await Promise.all([
      // Today's orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: todayStart }
        },
        _count: true,
        _sum: {
          total: true,
        }
      }),
      
      // This week's orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: weekStart }
        },
        _count: true,
        _sum: {
          total: true,
        }
      }),
      
      // This month's orders
      prisma.order.aggregate({
        where: {
          createdAt: { gte: monthStart }
        },
        _count: true,
        _sum: {
          total: true,
        }
      }),
      
      // Pending orders count
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Low stock variants (≤ 5)
      prisma.variant.findMany({
        where: {
          stock: { lte: 5 }
        },
        take: 20,
        orderBy: {
          stock: 'asc'
        },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              translations: {
                where: { locale: 'fr' }
              },
              brand: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        }
      }),
      
      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: {
            take: 1,
          }
        }
      })
    ])

    return NextResponse.json({
      todayOrders: {
        count: todayOrdersData._count,
        total: todayOrdersData._sum.total || 0
      },
      weekOrders: {
        count: weekOrdersData._count,
        total: weekOrdersData._sum.total || 0
      },
      monthOrders: {
        count: monthOrdersData._count,
        total: monthOrdersData._sum.total || 0
      },
      pendingOrdersCount,
      lowStockVariants,
      recentOrders
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
