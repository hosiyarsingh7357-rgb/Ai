import dynamic from 'next/dynamic'
import React from 'react'
import { ChartSkeleton } from '@/components/ui/ChartSkeleton'

export const EquityCurve = dynamic(
  () => import('@/components/dashboard/EquityCurve').then(mod => mod.EquityCurve),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 300 }), 
    ssr: false 
  }
)

export const ReplayChart = dynamic(
  () => import('@/components/analytics/ReplayChart').then(mod => mod.ReplayChart),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 400 }), 
    ssr: false 
  }
)

export const AICoachChat = dynamic(
  () => import('@/components/ai/AICoachChat').then(mod => mod.AICoachChat),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 500 }), 
    ssr: false 
  }
)

export const PnlBySetupChart = dynamic(
  () => import('@/components/analytics/PnlBySetupChart').then(mod => mod.PnlBySetupChart),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 300 }), 
    ssr: false 
  }
)

export const WinRateBySymbolChart = dynamic(
  () => import('@/components/analytics/WinRateBySymbolChart').then(mod => mod.WinRateBySymbolChart),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 300 }), 
    ssr: false 
  }
)

export const PsychologyChart = dynamic(
  () => import('@/components/analytics/PsychologyChart').then(mod => mod.PsychologyChart),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 350 }), 
    ssr: false 
  }
)

export const TemporalAnalysisChart = dynamic(
  () => import('@/components/analytics/TemporalAnalysisChart').then(mod => mod.TemporalAnalysisChart),
  { 
    loading: () => React.createElement(ChartSkeleton, { height: 300 }), 
    ssr: false 
  }
)


