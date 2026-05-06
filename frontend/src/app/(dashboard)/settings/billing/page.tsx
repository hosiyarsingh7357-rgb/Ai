'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { CheckCircle2, Zap, Gem, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useRequireAuth } from '@/hooks/useRequireAuth'

const PLANS = [
  {
    name: 'Pro',
    tier: 'pro',
    monthlyPrice: 29,
    annualPrice: 290,
    features: ['Unlimited Auto-Syncing', 'Advanced Analytics', 'Performance Reports', 'Priority Support'],
    icon: Zap,
    color: '#4F9CFB'
  },
  {
    name: 'Elite',
    tier: 'elite',
    monthlyPrice: 79,
    annualPrice: 790,
    features: ['AI Behavioral Coaching', 'Trade Replay Analysis', 'Prop Firm Risk Audit', 'Live Session Insights'],
    icon: Gem,
    color: '#00FF87'
  }
]

export default function BillingPage() {
  const { user } = useRequireAuth()
  const { openCheckout } = useRazorpay()
  const [loading, setLoading] = useState<string | null>(null)
  const [interval, setIntervalType] = useState<'monthly' | 'annual'>('monthly')

  const handleSubscribe = async (planType: string) => {
    try {
      setLoading(planType)
      
      // 1. Create Subscription on Backend
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, interval })
      })
      
      const sub = await response.json()
      
      if (!response.ok) throw new Error(sub.message || 'Failed to initialize subscription')

      // 2. Open Razorpay Checkout
      await openCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Public key
        subscription_id: sub.subscriptionId,
        name: 'Trade Journal AI',
        description: `${planType.toUpperCase()} Plan (${interval})`,
        handler: async (response: any) => {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/billing/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature
            })
          })
          
          if (verifyRes.ok) {
            window.location.reload() // Or show success state
          }
        },
        prefill: {
          name: user?.name || undefined,
          email: user?.email || undefined
        },
        theme: {
          color: '#00FF87'
        }
      })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Billing & Subscription</h1>
          <p className="text-[#94A3B8] mt-1 font-medium">Manage your plan and billing details.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setIntervalType('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${interval === 'monthly' ? 'bg-[#00FF87] text-[#0D0F14]' : 'text-slate-400 hover:text-white'}`}
          >
            MONTHLY
          </button>
          <button 
            onClick={() => setIntervalType('annual')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${interval === 'annual' ? 'bg-[#00FF87] text-[#0D0F14]' : 'text-slate-400 hover:text-white'}`}
          >
            ANNUAL (-20%)
          </button>
        </div>
      </div>

      {/* Current Plan Status */}
      <Card className="bg-white/[0.02] border-white/[0.05]">
        <CardBody className="p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00FF87]/10 flex items-center justify-center">
               <Gem className="text-[#00FF87]" size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Plan</p>
              <h3 className="text-2xl font-black text-white capitalize">{user?.subscriptionTier || 'Free'}</h3>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Next Billing</p>
                <p className="text-sm font-bold text-white font-num">May 27, 2026</p>
             </div>
             <div className="w-px h-10 bg-white/10 mx-2" />
             <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-bold text-emerald-400">ACTIVE</p>
             </div>
          </div>
        </CardBody>
      </Card>

      {/* Upgrade Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {PLANS.map(plan => (
           <Card key={plan.tier} className={`border-2 transition-all ${user?.subscriptionTier === plan.tier ? 'border-[#00FF87] bg-[#00FF87]/5' : 'border-white/5 bg-white/[0.01]'}`}>
              <CardBody className="p-8 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl`} style={{ background: `${plan.color}20` }}>
                       <plan.icon style={{ color: plan.color }} />
                    </div>
                    {user?.subscriptionTier === plan.tier && (
                      <span className="bg-[#00FF87] text-[#0D0F14] text-[10px] font-black px-2 py-1 rounded">CURRENT PLAN</span>
                    )}
                 </div>
                 
                 <div>
                    <h4 className="text-2xl font-black text-white">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mt-2">
                       <span className="text-3xl font-black text-white">${interval === 'monthly' ? plan.monthlyPrice : plan.annualPrice}</span>
                       <span className="text-sm font-bold text-slate-500">/{interval === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                         <CheckCircle2 size={16} className="text-[#00FF87]" />
                         <span className="text-sm text-slate-400">{f}</span>
                      </div>
                    ))}
                 </div>

                 <button
                   disabled={user?.subscriptionTier === plan.tier || loading === plan.tier}
                   onClick={() => handleSubscribe(plan.tier)}
                   className={`w-full py-4 rounded-xl font-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                     user?.subscriptionTier === plan.tier 
                     ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                     : 'bg-white text-[#0D0F14] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                   }`}
                 >
                   {loading === plan.tier ? 'INITIALIZING...' : user?.subscriptionTier === plan.tier ? 'MANAGE PLAN' : `UPGRADE TO ${plan.name.toUpperCase()}`}
                 </button>
              </CardBody>
           </Card>
         ))}
      </div>

      {/* Helpful Info */}
      <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex gap-4 items-start">
          <AlertCircle className="text-slate-400 shrink-0" size={20} />
          <p className="text-sm text-slate-400 leading-relaxed">
             Secure payments processed by Razorpay. You can cancel your subscription at any time from this dashboard. Your features will remain active until the end of your current billing period.
          </p>
      </div>
    </div>
  )
}
