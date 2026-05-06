import { stripe, STRIPE_PRICES } from '../../config/stripe.js';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/environment.js';
import { SubscriptionTier } from '@prisma/client';

export class BillingService {
  /**
   * Create a Stripe Checkout Session for a subscription
   */
  async createCheckoutSession(userId: string, priceId: string) {
    if (!stripe) {
      throw ApiError.internal('Stripe is not configured');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw ApiError.notFound('User');
    }

    // Determine customer ID
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Update or create subscription record with customer ID
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId: customerId },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          status: 'inactive',
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: `${env.FRONTEND_URL}/settings/billing?cancelled=true`,
      metadata: { userId: user.id },
    });

    return { url: session.url };
  }

  /**
   * Create a Stripe Customer Portal Session
   */
  async createPortalSession(userId: string) {
    if (!stripe) {
      throw ApiError.internal('Stripe is not configured');
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeCustomerId) {
      throw ApiError.badRequest('No active subscription found for this user');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/settings/billing`,
    });

    return { url: session.url };
  }

  /**
   * Handle Stripe Webhooks
   */
  async handleWebhook(body: string, signature: string) {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw ApiError.internal('Stripe Webhook is not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      throw ApiError.badRequest(`Webhook Error: ${err.message}`);
    }

    logger.info(`Processing Stripe Webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.handleSubscriptionChange(session.customer, session.subscription);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await this.handleSubscriptionChange(subscription.customer, subscription.id);
        break;
      }
      default:
        logger.debug(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Sync subscription status from Stripe to DB
   */
  private async handleSubscriptionChange(customerId: string, stripeSubscriptionId: string) {
    if (!stripe) return;

    const fullSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const userId = fullSubscription.metadata.userId;

    if (!userId) {
      logger.error('Subscription update missing userId metadata');
      return;
    }

    // Map Price ID to SubscriptionTier
    let tier: SubscriptionTier = SubscriptionTier.free;
    const priceId = fullSubscription.items.data[0]?.price.id;

    if (priceId === STRIPE_PRICES.proMonthly || priceId === STRIPE_PRICES.proAnnual) {
      tier = SubscriptionTier.pro;
    } else if (priceId === STRIPE_PRICES.eliteMonthly || priceId === STRIPE_PRICES.eliteAnnual) {
      tier = SubscriptionTier.elite;
    }

    const status = fullSubscription.status; // active, trialing, past_due, canceled, etc.
    const currentTier = status === 'active' || status === 'trialing' ? tier : SubscriptionTier.free;

    await prisma.$transaction([
      prisma.subscription.update({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId,
          status: status,
          currentPeriodStart: new Date(fullSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(fullSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: fullSubscription.cancel_at_period_end,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: currentTier,
          subscriptionExpiresAt: new Date(fullSubscription.current_period_end * 1000),
        },
      }),
    ]);

    logger.info(`Updated subscription for user ${userId} to tier ${currentTier}`);
  }
}

export const billingService = new BillingService();
