import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'

const TIER_ORDER: Record<string, number> = {
  free: 0,
  pro: 1,
  elite: 2,
}

// Usage: router.get('/ai/coach', authenticate, requirePlan('elite'), controller)
export const requirePlan =
  (minTier: 'pro' | 'elite') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const userTier = (req as any).user?.subscriptionTier || 'free'
    const userLevel = TIER_ORDER[userTier.toLowerCase()] ?? 0
    const requiredLevel = TIER_ORDER[minTier] ?? 0

    if (userLevel >= requiredLevel) {
      next()
    } else {
      next(ApiError.upgradeRequired(minTier))
    }
  }
