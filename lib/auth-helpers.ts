import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Verify admin session in API routes
 * Returns the session if valid, or null if not authenticated
 */
export async function verifyAdminSession() {
  const session = await auth()
  return session
}

/**
 * Require admin authentication in API routes
 * Returns unauthorized response if not authenticated
 * Returns session if authenticated
 */
export async function requireAdmin() {
  const session = await verifyAdminSession()
  
  if (!session || !session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
  }
  
  return {
    authorized: true,
    session
  }
}
