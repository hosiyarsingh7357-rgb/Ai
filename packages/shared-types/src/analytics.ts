// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface OverviewStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  avgRMultiple: number
  largestWin: number
  largestLoss: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  avgTradeDurationMinutes: number
  totalCommissions: number
  periodStart: string
  periodEnd: string
}

export interface EquityPoint {
  date: string
  cumulativePnl: number
  dailyPnl: number
  tradeCount: number
}

export interface DrawdownPoint {
  date: string
  drawdown: number
  peak: number
  trough: number
}

export interface SymbolPerformance {
  symbol: string
  assetClass: string
  totalTrades: number
  winRate: number
  netPnl: number
  avgPnl: number
  profitFactor: number
}

export interface DayPerformance {
  day: number // 0=Mon, 6=Sun
  dayName: string
  totalTrades: number
  winRate: number
  netPnl: number
  avgPnl: number
}

export interface SessionPerformance {
  session: string
  totalTrades: number
  winRate: number
  netPnl: number
  avgPnl: number
}

export interface SetupPerformance {
  setupType: string
  totalTrades: number
  winRate: number
  netPnl: number
  avgRMultiple: number
  profitFactor: number
}

export interface EmotionPerformance {
  emotion: string
  totalTrades: number
  winRate: number
  netPnl: number
  avgPnl: number
}

export interface RMultiplePoint {
  bucket: string // e.g. "-3 to -2"
  count: number
}

export interface StreakData {
  currentStreak: number
  currentStreakType: 'win' | 'loss' | 'none'
  longestWinStreak: number
  longestLossStreak: number
  streakHistory: Array<{
    type: 'win' | 'loss'
    length: number
    startDate: string
    endDate: string
  }>
}

export interface PropFirmMetrics {
  accountId: string
  currentBalance: number
  initialBalance: number
  profitTarget: number
  maxDrawdown: number
  dailyLossLimit: number
  currentDrawdown: number
  todayPnl: number
  consistencyScore: number
  isAtRisk: boolean
  tradingDays: number
  profitableDays: number
}
