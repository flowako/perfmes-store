import { handlers } from '@/lib/auth'

/**
 * NextAuth v5 API route handler
 * Handles all auth routes: /api/auth/signin, /api/auth/signout, etc.
 */
export const { GET, POST } = handlers
