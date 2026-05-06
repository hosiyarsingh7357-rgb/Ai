import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'
import { calculatePnL, detectSession, getDayOfWeek } from './pnl.service.js'
import type { CreateTradeInput, UpdateTradeInput, ListTradesQuery } from '../../validations/trade.validation.js'
import type { Prisma } from '@prisma/client'

export async function listTrades(userId: string, query: ListTradesQuery) {
  const {
    page, limit, accountId, symbol, assetClass, direction, status,
    dateFrom, dateTo, setupType, emotionalState, minPnl, maxPnl,
    tagId, sortBy, sortOrder,
  } = query

  const where: Prisma.TradeWhereInput = {
    userId,
    deletedAt: null,
    ...(accountId && { accountId }),
    ...(symbol && { symbol: { contains: symbol.toUpperCase() } }),
    ...(assetClass && { assetClass }),
    ...(direction && { direction }),
    ...(status && { status }),
    ...(dateFrom || dateTo
      ? {
          entryDate: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
    ...(setupType && { setupType: { contains: setupType, mode: 'insensitive' } }),
    ...(emotionalState && { emotionalStateEntry: emotionalState }),
    ...(minPnl !== undefined || maxPnl !== undefined
      ? {
          netPnl: {
            ...(minPnl !== undefined && { gte: minPnl }),
            ...(maxPnl !== undefined && { lte: maxPnl }),
          },
        }
      : {}),
    ...(tagId && {
      tags: { some: { tagId } },
    }),
  }

  const orderBy: Prisma.TradeOrderByWithRelationInput =
    sortBy === 'entryDate'
      ? { entryDate: sortOrder }
      : sortBy === 'netPnl'
        ? { netPnl: sortOrder }
        : sortBy === 'symbol'
          ? { symbol: sortOrder }
          : { createdAt: sortOrder }

  const skip = (page - 1) * limit

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        screenshots: true,
      },
    }),
    prisma.trade.count({ where }),
  ])

  return {
    trades,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getTradeById(tradeId: string, userId: string) {
  const trade = await prisma.trade.findFirst({
    where: { id: tradeId, userId, deletedAt: null },
    include: {
      tags: { include: { tag: true } },
      screenshots: true,
      legs: { orderBy: { legNumber: 'asc' } },
      playbook: true,
      journalNotes: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!trade) throw ApiError.notFound('Trade')
  return trade
}

export async function createTrade(userId: string, input: CreateTradeInput) {
  // Verify account ownership
  const account = await prisma.tradingAccount.findFirst({
    where: { id: input.accountId, userId, isActive: true },
  })
  if (!account) throw ApiError.notFound('Trading account')

  // Check subscription tier and limits
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.subscriptionTier === 'free') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const tradeCount = await prisma.trade.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
        deletedAt: null,
      },
    })

    if (tradeCount >= 30) {
       throw ApiError.upgradeRequired('pro', 'Free tier is limited to 30 trades per month.')
    }
  }

  const entryDate = new Date(input.entryDate)
  const exitDate = input.exitDate ? new Date(input.exitDate) : undefined

  const pnl = calculatePnL({
    direction: input.direction,
    entryPrice: input.entryPrice,
    exitPrice: input.exitPrice,
    quantity: input.quantity,
    commission: input.commission,
    swapFees: input.swapFees,
    stopLoss: input.stopLoss,
    accountBalance: account.currentBalance?.toNumber(),
    entryDate,
    exitDate,
  })

  const session = input.session ?? detectSession(entryDate)
  const dayOfWeek = getDayOfWeek(entryDate)

  const { tagIds, ...tradeData } = input

  const trade = await prisma.trade.create({
    data: {
      ...tradeData,
      userId,
      entryDate,
      exitDate,
      grossPnl: pnl.grossPnl,
      netPnl: pnl.netPnl,
      riskRewardRatio: pnl.riskRewardRatio,
      riskPercent: pnl.riskPercent,
      tradeDurationMinutes: pnl.tradeDurationMinutes,
      session: session as never,
      dayOfWeek,
      // Connect tags
      ...(tagIds.length > 0 && {
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      }),
    },
    include: {
      tags: { include: { tag: true } },
      screenshots: true,
    },
  })

  return trade
}

export async function updateTrade(tradeId: string, userId: string, input: UpdateTradeInput) {
  const existing = await prisma.trade.findFirst({
    where: { id: tradeId, userId, deletedAt: null },
  })
  if (!existing) throw ApiError.notFound('Trade')

  const entryDate = input.entryDate ? new Date(input.entryDate) : existing.entryDate
  const exitDate = input.exitDate ? new Date(input.exitDate) : existing.exitDate ?? undefined

  // Recalculate P&L if prices changed
  const pnl = calculatePnL({
    direction: (input.direction ?? existing.direction) as 'long' | 'short',
    entryPrice: input.entryPrice ?? existing.entryPrice.toNumber(),
    exitPrice: input.exitPrice ?? existing.exitPrice?.toNumber(),
    quantity: input.quantity ?? existing.quantity.toNumber(),
    commission: input.commission ?? existing.commission.toNumber(),
    swapFees: input.swapFees ?? existing.swapFees.toNumber(),
    stopLoss: input.stopLoss ?? existing.stopLoss?.toNumber(),
    entryDate,
    exitDate,
  })

  const { tagIds, ...updateData } = input

  const trade = await prisma.trade.update({
    where: { id: tradeId },
    data: {
      ...updateData,
      entryDate,
      exitDate,
      grossPnl: pnl.grossPnl,
      netPnl: pnl.netPnl,
      riskRewardRatio: pnl.riskRewardRatio,
      riskPercent: pnl.riskPercent,
      tradeDurationMinutes: pnl.tradeDurationMinutes,
      dayOfWeek: getDayOfWeek(entryDate),
      // Replace tags if provided
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      }),
    },
    include: {
      tags: { include: { tag: true } },
      screenshots: true,
    },
  })

  return trade
}

export async function deleteTrade(tradeId: string, userId: string) {
  const existing = await prisma.trade.findFirst({
    where: { id: tradeId, userId, deletedAt: null },
  })
  if (!existing) throw ApiError.notFound('Trade')

  // Soft delete
  await prisma.trade.update({
    where: { id: tradeId },
    data: { deletedAt: new Date() },
  })
}
