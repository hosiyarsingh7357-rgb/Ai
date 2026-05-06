/**
 * P&L and trade metric calculations
 * All decimal operations use number with rounding to avoid floating point issues
 */

const round = (n: number, decimals = 2) => Math.round(n * 10 ** decimals) / 10 ** decimals

export interface PnLResult {
  grossPnl: number
  netPnl: number
  riskRewardRatio: number | null
  riskPercent: number | null
  tradeDurationMinutes: number | null
}

export function calculatePnL(params: {
  direction: 'long' | 'short'
  entryPrice: number
  exitPrice?: number
  quantity: number
  commission: number
  swapFees: number
  stopLoss?: number
  accountBalance?: number
  entryDate: Date
  exitDate?: Date
}): PnLResult {
  const {
    direction,
    entryPrice,
    exitPrice,
    quantity,
    commission,
    swapFees,
    stopLoss,
    accountBalance,
    entryDate,
    exitDate,
  } = params

  let grossPnl = 0
  if (exitPrice !== undefined) {
    const priceDiff =
      direction === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice
    grossPnl = round(priceDiff * quantity)
  }

  const netPnl = round(grossPnl - commission - swapFees)

  // Risk/reward ratio: (takeProfit is not in P&L calc, but R:R from SL)
  let riskRewardRatio: number | null = null
  if (stopLoss && exitPrice) {
    const risk = Math.abs(entryPrice - stopLoss) * quantity
    const reward = Math.abs(exitPrice - entryPrice) * quantity
    if (risk > 0) riskRewardRatio = round(reward / risk, 4)
  }

  // Risk as % of account
  let riskPercent: number | null = null
  if (stopLoss && accountBalance && accountBalance > 0) {
    const riskAmount = Math.abs(entryPrice - stopLoss) * quantity
    riskPercent = round((riskAmount / accountBalance) * 100, 4)
  }

  // Duration in minutes
  let tradeDurationMinutes: number | null = null
  if (exitDate) {
    tradeDurationMinutes = Math.round((exitDate.getTime() - entryDate.getTime()) / 60000)
  }

  return { grossPnl, netPnl, riskRewardRatio, riskPercent, tradeDurationMinutes }
}

export function detectSession(entryDate: Date, timezone = 'UTC'): string {
  // Convert to UTC hour for session detection
  const utcHour = entryDate.getUTCHours()

  if (utcHour >= 0 && utcHour < 5) return 'asian'
  if (utcHour >= 7 && utcHour < 12) return 'london'
  if (utcHour >= 12 && utcHour < 13) return 'overlap' // London-NY overlap
  if (utcHour >= 13 && utcHour < 21) return 'new_york'
  return 'after_hours'
}

export function getDayOfWeek(date: Date): number {
  // 0=Mon, 6=Sun (PRD convention)
  const jsDay = date.getDay() // 0=Sun in JS
  return jsDay === 0 ? 6 : jsDay - 1
}

export function calculateRMultiple(
  netPnl: number,
  entryPrice: number,
  stopLoss: number,
  quantity: number
): number | null {
  const initialRisk = Math.abs(entryPrice - stopLoss) * quantity
  if (initialRisk === 0) return null
  return round(netPnl / initialRisk, 4)
}
