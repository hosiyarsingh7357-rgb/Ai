import { z } from 'zod'

const assetClassEnum = z.enum(['stocks', 'forex', 'crypto', 'futures', 'options', 'cfd', 'other'])
const directionEnum = z.enum(['long', 'short'])
const statusEnum = z.enum(['open', 'closed', 'partial'])
const emotionEnum = z.enum(['calm', 'anxious', 'confident', 'fearful', 'greedy', 'neutral'])
const sessionEnum = z.enum(['asian', 'london', 'new_york', 'overlap', 'after_hours'])

export const createTradeSchema = z.object({
  accountId: z.string().uuid(),
  symbol: z.string().min(1).max(50).toUpperCase(),
  assetClass: assetClassEnum,
  direction: directionEnum,
  status: statusEnum.default('open'),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  commission: z.number().min(0).default(0),
  swapFees: z.number().min(0).default(0),
  setupType: z.string().max(100).optional(),
  entryReason: z.string().optional(),
  exitReason: z.string().optional(),
  emotionalStateEntry: emotionEnum.optional(),
  emotionalStateExit: emotionEnum.optional(),
  session: sessionEnum.optional(),
  playbookId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  mistakes: z.array(z.string()).default([]),
  rulesFollowed: z.boolean().optional(),
  notes: z.string().optional(),
  importSource: z.string().max(50).optional(),
  externalId: z.string().max(255).optional(),
  tagIds: z.array(z.string().uuid()).default([]),
})

export const updateTradeSchema = createTradeSchema.partial().omit({ accountId: true, importSource: true, externalId: true })

export const listTradesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  accountId: z.string().uuid().optional(),
  symbol: z.string().optional(),
  assetClass: assetClassEnum.optional(),
  direction: directionEnum.optional(),
  status: statusEnum.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  setupType: z.string().optional(),
  emotionalState: emotionEnum.optional(),
  minPnl: z.coerce.number().optional(),
  maxPnl: z.coerce.number().optional(),
  tagId: z.string().uuid().optional(),
  sortBy: z.enum(['entryDate', 'netPnl', 'symbol', 'createdAt']).default('entryDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateTradeInput = z.infer<typeof createTradeSchema>
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>
export type ListTradesQuery = z.infer<typeof listTradesQuerySchema>
