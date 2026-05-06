// ─── AI Types ─────────────────────────────────────────────────────────────────

import type { InsightType } from './trade'

export interface AIInsight {
  id: string
  userId: string
  insightType: InsightType
  title: string
  content: string
  structuredData?: BehavioralInsight[] | PatternInsight[] | Record<string, unknown>
  tradesAnalyzedCount?: number
  periodStart?: string
  periodEnd?: string
  geminiModel: string
  tokensUsed?: number
  createdAt: string
}

export interface BehavioralInsight {
  title: string
  description: string
  actionItem: string
  severity: 'high' | 'medium' | 'low'
  metric?: string
  metricValue?: string | number
}

export interface PatternInsight {
  pattern: string
  frequency: number
  avgPnl: number
  winRate: number
  recommendation: string
}

export interface AIReport {
  id: string
  userId: string
  title: string
  periodStart: string
  periodEnd: string
  weekSummary: string
  behavioralAlert?: string
  bestSetup?: string
  improvementArea?: string
  nextWeekFocus?: string
  progressVsLastWeek?: string
  fullContent: string
  geminiModel: string
  tokensUsed?: number
  emailSent: boolean
  emailSentAt?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AICoachSession {
  id: string
  userId: string
  messages: ChatMessage[]
  contextTradesCount: number
  createdAt: string
  updatedAt: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    nextCursor?: string
  }
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
  statusCode: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}
