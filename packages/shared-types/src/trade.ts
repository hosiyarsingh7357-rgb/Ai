// ─── Trade Types ──────────────────────────────────────────────────────────────

export type AssetClass = 'stocks' | 'forex' | 'crypto' | 'futures' | 'options' | 'cfd' | 'other'
export type Direction = 'long' | 'short'
export type TradeStatus = 'open' | 'closed' | 'partial'
export type EmotionalState = 'calm' | 'anxious' | 'confident' | 'fearful' | 'greedy' | 'neutral'
export type MarketSession = 'asian' | 'london' | 'new_york' | 'overlap' | 'after_hours'
export type AccountType = 'live' | 'demo' | 'prop_firm' | 'paper'
export type SubscriptionTier = 'free' | 'pro' | 'elite'
export type TradingExperience = 'beginner' | 'intermediate' | 'advanced' | 'professional'
export type PrimaryAssetClass = 'stocks' | 'forex' | 'crypto' | 'futures' | 'options' | 'mixed'
export type InsightType =
  | 'behavioral'
  | 'pattern'
  | 'weekly_report'
  | 'coach_chat'
  | 'trade_analysis'

export interface Tag {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
}

export interface TradingAccount {
  id: string
  userId: string
  name: string
  broker: string
  accountType: AccountType
  currency: string
  initialBalance: number
  currentBalance: number
  propFirmName?: string
  propFirmRules?: {
    maxDrawdown: number
    dailyLossLimit: number
    profitTarget: number
  }
  isActive: boolean
  createdAt: string
}

export interface Trade {
  id: string
  userId: string
  accountId: string
  symbol: string
  assetClass: AssetClass
  direction: Direction
  status: TradeStatus
  entryDate: string
  exitDate?: string
  entryPrice: number
  exitPrice?: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  grossPnl?: number
  netPnl?: number
  commission: number
  swapFees: number
  riskRewardRatio?: number
  riskAmount?: number
  riskPercent?: number
  setupType?: string
  entryReason?: string
  exitReason?: string
  emotionalStateEntry?: EmotionalState
  emotionalStateExit?: EmotionalState
  session?: MarketSession
  dayOfWeek?: number
  tradeDurationMinutes?: number
  mae?: number
  mfe?: number
  playbookId?: string
  rating?: number
  mistakes?: string[]
  rulesFollowed?: boolean
  notes?: string
  aiAnalysis?: Record<string, unknown>
  aiAnalyzedAt?: string
  importSource?: string
  externalId?: string
  tags?: Tag[]
  screenshots?: TradeScreenshot[]
  createdAt: string
  updatedAt: string
}

export interface TradeLeg {
  id: string
  tradeId: string
  legNumber: number
  action: 'buy' | 'sell'
  quantity: number
  price: number
  executedAt: string
  commission: number
  notes?: string
}

export interface TradeScreenshot {
  id: string
  tradeId: string
  url: string
  publicId: string
  caption?: string
  createdAt: string
}

export interface JournalNote {
  id: string
  userId: string
  tradeId?: string
  date: string
  content: string
  mood?: EmotionalState
  marketBias?: 'bullish' | 'bearish' | 'neutral'
  createdAt: string
  updatedAt: string
}

export interface Playbook {
  id: string
  userId: string
  name: string
  description?: string
  setupType: string
  entryRules: string
  exitRules: string
  riskRules?: string
  markets?: string[]
  timeframes?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
