import { Request, Response, NextFunction } from 'express';
import { SubscriptionTier } from '@prisma/client';
import asyncHandler from 'express-async-handler';

/**
 * Middleware to restrict access based on subscription tier
 * @param requiredTier The minimum tier required to access the route
 */
export const requireTier = (requiredTier: SubscriptionTier) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const tierHierarchy: Record<SubscriptionTier, number> = {
      [SubscriptionTier.free]: 0,
      [SubscriptionTier.pro]: 1,
      [SubscriptionTier.elite]: 2,
    };

    const userTier: SubscriptionTier = user.subscriptionTier || SubscriptionTier.free;

    if (tierHierarchy[userTier] < tierHierarchy[requiredTier]) {
      res.status(403);
      throw new Error(`This feature requires a ${requiredTier} subscription.`);
    }

    next();
  });
};
