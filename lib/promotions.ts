import { Promotion } from '@prisma/client'

/**
 * Check if a promotion is currently active
 * A promotion is active when:
 * - isActive flag is true
 * - Current date is between startDate and endDate
 */
export function isPromotionActive(promotion: Promotion): boolean {
  if (!promotion.isActive) return false
  
  const now = new Date()
  const start = new Date(promotion.startDate)
  const end = new Date(promotion.endDate)
  
  return now >= start && now <= end
}

/**
 * Get hours remaining until promotion ends
 * Returns null if promotion has ended
 */
export function getPromotionHoursRemaining(promotion: Promotion): number | null {
  if (!isPromotionActive(promotion)) return null
  
  const now = new Date()
  const end = new Date(promotion.endDate)
  
  const diffMs = end.getTime() - now.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  
  return hours > 0 ? hours : null
}
