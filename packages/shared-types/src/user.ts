// ─── User Types ───────────────────────────────────────────────────────────────

import type { SubscriptionTier, TradingExperience, PrimaryAssetClass, TradingAccount } from './trade'

export interface User {
  id: string
  email: string
  emailVerified?: string
  name?: string
  image?: string
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt?: string
  timezone: string
  defaultCurrency: string
  onboardingCompleted: boolean
  tradingExperience?: TradingExperience
  primaryAssetClass?: PrimaryAssetClass
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: string
  userId: string
  emailWeeklyReport: boolean
  emailTradeReminders: boolean
  emailMarketing: boolean
  defaultAccountId?: string
  defaultDateRange: '7d' | '30d' | '90d' | 'ytd' | 'all'
  showCommissions: boolean
  rMultipleGoal?: number
  dailyLossLimitAlert?: number
  createdAt: string
  updatedAt: string
}

export interface ProgressGoal {
  id: string
  userId: string
  type: 'win_rate' | 'profit_factor' | 'monthly_pnl' | 'streak' | 'consistency'
  target: number
  current: number
  period: 'weekly' | 'monthly' | 'quarterly'
  startDate: string
  endDate: string
  achieved: boolean
  createdAt: string
}

// API auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface TradingAccountWithStats extends TradingAccount {
  totalTrades: number
  netPnl: number
  winRate: number
}
