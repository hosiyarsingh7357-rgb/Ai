'use client'

import React, { useState } from 'react'
import { m } from 'framer-motion'
import { Check, Shield, Zap, Crown, ArrowRight } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { apiClient } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { useRazorpay } from '@/hooks/useRazorpay'

const tiers = [
  {
    name: 'Free',
    id: 'free',
    priceId: 'free',
    price: '$0',
    description: 'Perfect for beginners starting their trading journey.',
    features: [
      '30 trades per month',
      'Basic journal entries',
      'Community analytics',
      'Public playbooks (view only)',
    ],
    cta: 'Get Started',
    icon: Shield,
    color: 'gray',
  },
  {
    name: 'Pro',
    id: 'pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    price: '$29',
    interval: 'month',
    description: 'Advanced tools for serious traders looking for an edge.',
    features: [
      'Unlimited trades',
      'AI-Powered Insights (GPT-4)',
      'Custom Performance Reports',
      'Up to 3 Private Playbooks',
      'Psychology tagging',
    ],
    cta: 'Upgrade to Pro',
    icon: Zap,
    color: 'green',
    popular: true,
  },
  {
    name: 'Elite',
    id: 'elite',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY || 'price_elite_monthly',
    price: '$79',
    interval: 'month',
    description: 'The ultimate toolkit for professional and institutional traders.',
    features: [
      'Everything in Pro',
      'Advanced AI Strategy Coach',
      'Backtesting Suite',
      'Unlimited Private Playbooks',
      'Priority Support',
    ],
    cta: 'Go Elite',
    icon: Crown,
    color: 'gold',
  },
]

export default function PricingPage() {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState<string | null>(null)
  const { openCheckout } = useRazorpay()

  const handleSubscription = async (tierId: string, interval: 'monthly' | 'annual' = 'monthly') => {
    if (tierId === 'free') return;
    if (!user) {
      window.location.href = '/login'
      return
    }

    try {
      setLoading(tierId)
      
      // 1. Create Subscription on Backend
      const { data: subData } = await apiClient.post('/billing/create-subscription', {
        planType: tierId,
        interval,
      });

      const subscriptionId = subData.subscriptionId;

      // 2. Open Razorpay Checkout
      openCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890abcd', // Fallback to test key
        name: 'Trade Journal',
        description: `${tierId.charAt(0).toUpperCase() + tierId.slice(1)} Subscription`,
        subscription_id: subscriptionId,
        handler: async (response) => {
          try {
            // 3. Verify Payment on Backend
            await apiClient.post('/billing/verify-payment', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature,
            });
            
            // Reload page or navigate to dashboard upon success
            window.location.href = '/dashboard/settings/billing'
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user.name || 'Trader',
          email: user.email,
        },
        theme: {
          color: '#10b981', // Match the green theme
        }
      });

    } catch (error) {
      console.error('Checkout failed:', error)
      alert((error as any).response?.data?.message || 'Checkout initialization failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent"
          >
            Level Up Your Trading
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the plan that fits your growth. Unlock advanced AI analytics and unlimited journaling.
          </m.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <m.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}
              className="h-full"
            >
              <Card 
                className={cn(
                  "relative h-full flex flex-col border-2",
                  tier.popular ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-border"
                )}
                glow={tier.id === 'pro' ? 'green' : 'none'}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="flex flex-col items-start gap-4 pb-8">
                  <div className={cn(
                    "p-3 rounded-xl bg-opacity-10",
                    tier.color === 'green' ? "bg-primary text-primary" : 
                    tier.color === 'gold' ? "bg-yellow-500 text-yellow-500" : "bg-muted text-muted-foreground"
                  )}>
                    <tier.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{tier.description}</p>
                  </div>
                </CardHeader>

                <CardBody className="flex-grow flex flex-col pt-0">
                  <div className="mb-8">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.interval && <span className="text-muted-foreground">/{tier.interval}</span>}
                  </div>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check size={18} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? 'primary' : 'secondary'}
                    className="w-full group"
                    disabled={user?.subscriptionTier === tier.id || (loading !== null && loading !== tier.id)}
                    onClick={() => handleSubscription(tier.id, 'monthly')}
                  >
                    {user?.subscriptionTier === tier.id ? 'Current Plan' : (
                      <>
                        {loading === tier.id ? 'Processing...' : tier.cta}
                        {tier.id !== 'free' && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                      </>
                    )}
                  </Button>
                </CardBody>
              </Card>
            </m.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-muted-foreground text-sm">
            Secure payments processed by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
