import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { settingsSchema } from '@/lib/validation'

/**
 * GET /api/admin/settings
 * Description: Get all settings for admin editing
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/settings
 * Description: Update store settings
 * Body:
 * - storeNameFr: string
 * - storeNameAr: string
 * - phone: string
 * - email: string
 * - instagramUrl: string
 * - bannerTextFr: string
 * - bannerTextAr: string
 * - bannerEnabled: boolean
 * Requires: Admin authentication
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.authorized) return auth.response

    const body = await request.json()
    
    // Validate body
    const validatedData = settingsSchema.parse(body)

    // Upsert settings
    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: validatedData,
      create: {
        id: 'singleton',
        ...validatedData
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
