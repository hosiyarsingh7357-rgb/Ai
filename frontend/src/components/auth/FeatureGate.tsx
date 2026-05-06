'use client'
import React from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth.store'

interface FeatureGateProps {
  children: React.ReactNode
  requiredTier: 'PRO' | 'ELITE'
  fallback?: React.ReactNode
}

const TIER_HIERARCHY = {
  FREE: 0,
  PRO: 1,
  ELITE: 2,
}

export function FeatureGate({ children, requiredTier, fallback }: FeatureGateProps) {
  const { user } = useAuthStore()
  const userTier = (user?.subscriptionTier || 'FREE') as keyof typeof TIER_HIERARCHY
  
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="relative overflow-hidden border-dashed border-2 border-white/10 bg-white/[0.02]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
          <Lock className="text-white opacity-60" size={20} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{requiredTier} Feature</h3>
        <p className="text-sm text-[#94A3B8] max-w-xs mb-6">
          This feature is only available for {requiredTier} subscribers. Upgrade your plan to unlock full potential.
        </p>
        <Link 
          href="/settings/billing"
          className="px-6 py-2.5 bg-white text-black font-bold rounded-xl text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Upgrade Now
        </Link>
      </div>
      <CardBody className="opacity-10 grayscale pointer-events-none select-none">
        {children}
      </CardBody>
    </Card>
  )
}
