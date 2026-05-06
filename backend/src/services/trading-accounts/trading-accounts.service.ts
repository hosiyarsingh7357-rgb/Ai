import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'
import type { AccountType } from '@prisma/client'

export interface CreateTradingAccountInput {
  name: string
  broker?: string
  accountType: AccountType
  currency: string
  initialBalance: number
}

export interface UpdateTradingAccountInput {
  name?: string
  broker?: string
  accountType?: AccountType
  currency?: string
  initialBalance?: number
  isActive?: boolean
}

export async function listTradingAccounts(userId: string) {
  return prisma.tradingAccount.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { trades: true }
      }
    }
  })
}

export async function getTradingAccountById(id: string, userId: string) {
  const account = await prisma.tradingAccount.findFirst({
    where: { id, userId }
  })
  if (!account) throw ApiError.notFound('Trading account')
  return account
}

export async function createTradingAccount(userId: string, data: CreateTradingAccountInput) {
  return prisma.tradingAccount.create({
    data: {
      ...data,
      userId,
      currentBalance: data.initialBalance
    }
  })
}

export async function updateTradingAccount(id: string, userId: string, data: UpdateTradingAccountInput) {
  const account = await getTradingAccountById(id, userId)
  
  return prisma.tradingAccount.update({
    where: { id },
    data
  })
}

export async function deleteTradingAccount(id: string, userId: string) {
  const account = await getTradingAccountById(id, userId)
  
  // Check if account has trades
  const tradesCount = await prisma.trade.count({
    where: { accountId: id }
  })
  
  if (tradesCount > 0) {
    throw ApiError.badRequest('Cannot delete account with existing trades. Deactivate it instead.')
  }
  
  return prisma.tradingAccount.delete({
    where: { id }
  })
}
