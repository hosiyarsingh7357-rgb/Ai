import crypto from 'crypto';
import { razorpay, RAZORPAY_PLANS } from '../../config/razorpay';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';
import { env } from '../../config/environment';
import { SubscriptionTier } from '@prisma/client';

export class RazorpayService {
  /**
   * Create a Razorpay Subscription
   */
  async createSubscription(userId: string, planType: 'pro' | 'elite', interval: 'monthly' | 'annual') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User');
    }

    const planKey = `${planType}${interval.charAt(0).toUpperCase() + interval.slice(1)}` as keyof typeof RAZORPAY_PLANS;
    const planId = RAZORPAY_PLANS[planKey];

    if (!planId) {
      throw ApiError.internal(`Razorpay Plan ID for ${planKey} is not configured`);
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: interval === 'monthly' ? 12 : 1, // Number of billing cycles
      notes: {
        userId: user.id,
        planType,
      },
    });

    // Save subscription intent to DB
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: planId,
        status: 'created',
      },
      create: {
        userId: user.id,
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: planId,
        status: 'created',
      },
    });

    return {
      subscriptionId: subscription.id,
      currency: 'INR', // Razorpay standard
    };
  }

  /**
   * Verify Payment Signature
   */
  async verifyPayment(userId: string, razorpayPaymentId: string, razorpaySubscriptionId: string, razorpaySignature: string) {
    const secret = env.RAZORPAY_KEY_SECRET;
    if (!secret) throw ApiError.internal('Razorpay Secret not configured');

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw ApiError.badRequest('Invalid payment signature');
    }

    // Update user tier
    const subIntent = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    if (!subIntent) throw ApiError.notFound('Subscription intent');

    // Determine tier from Plan ID
    let tier: SubscriptionTier = SubscriptionTier.pro;
    if (subIntent.razorpayPlanId === RAZORPAY_PLANS.eliteMonthly || subIntent.razorpayPlanId === RAZORPAY_PLANS.eliteAnnual) {
      tier = SubscriptionTier.elite;
    }

    await prisma.$transaction([
      prisma.subscription.update({
        where: { razorpaySubscriptionId },
        data: { status: 'active' },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days, webhook will fix it precisely
        },
      }),
    ]);

    return { success: true, tier };
  }

  /**
   * Handle Razorpay Webhooks
   */
  async handleWebhook(payload: any, signature: string) {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw ApiError.internal('Razorpay Webhook Secret not configured');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = payload.event;
    const data = payload.payload;

    logger.info(`Processing Razorpay Webhook: ${event}`);

    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged':
        await this.syncSubscriptionStatus(data.subscription.entity);
        break;
      case 'subscription.cancelled':
      case 'subscription.halted':
        await this.handleCancellation(data.subscription.entity);
        break;
    }

    return { received: true };
  }

  private async syncSubscriptionStatus(razorSub: any) {
    const userId = razorSub.notes?.userId;
    if (!userId) return;

    let tier: SubscriptionTier = SubscriptionTier.pro;
    const planId = razorSub.plan_id;
    if (planId === RAZORPAY_PLANS.eliteMonthly || planId === RAZORPAY_PLANS.eliteAnnual) {
      tier = SubscriptionTier.elite;
    }

    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId },
        data: {
          status: razorSub.status,
          currentPeriodStart: new Date(razorSub.current_start * 1000),
          currentPeriodEnd: new Date(razorSub.current_end * 1000),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionExpiresAt: new Date(razorSub.current_end * 1000),
        },
      }),
    ]);
  }

  private async handleCancellation(razorSub: any) {
    const userId = razorSub.notes?.userId;
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: SubscriptionTier.free,
      },
    });

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'cancelled',
      },
    });
  }

  async getPortalUrl(userId: string) {
    // For Razorpay, we redirect to the local billing settings or 
    // a hosted page if using a different provider in the future.
    return `${env.FRONTEND_URL}/dashboard/settings/billing`;
  }

  async getSubscriptionStatus(userId: string) {
    return prisma.subscription.findUnique({
      where: { userId }
    });
  }
}

export const razorpayService = new RazorpayService();
