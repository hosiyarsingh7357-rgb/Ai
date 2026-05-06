import { PrismaClient, TradeStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getOverview(userId: string) {
    const trades = await prisma.trade.findMany({
      where: { userId, status: TradeStatus.closed },
      orderBy: { exitDate: 'asc' },
    });

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalNetPnl: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
      };
    }

    const wins = trades.filter(t => Number(t.netPnl || 0) > 0);
    const losses = trades.filter(t => Number(t.netPnl || 0) <= 0);

    const totalNetPnl = trades.reduce((sum, t) => sum + (Number(t.netPnl) || 0), 0);
    const grossProfit = wins.reduce((sum, t) => sum + (Number(t.netPnl) || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (Number(t.netPnl) || 0), 0));

    const winRate = (wins.length / trades.length) * 100;
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const recentTrades = [...trades].sort((a, b) => 
      new Date(b.exitDate!).getTime() - new Date(a.exitDate!).getTime()
    ).slice(0, 5);

    return {
      totalTrades: trades.length,
      winRate: Math.round(winRate * 100) / 100,
      totalNetPnl: Math.round(totalNetPnl * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgWin: wins.length > 0 ? Math.round((grossProfit / wins.length) * 100) / 100 : 0,
      avgLoss: losses.length > 0 ? Math.round((grossLoss / losses.length) * 100) / 100 : 0,
      recentTrades: recentTrades.map(t => ({
        symbol: t.symbol,
        netPnl: Number(t.netPnl),
        exitDate: t.exitDate,
      })),
    };
  }

  async getEquityCurve(userId: string) {
    const trades = await prisma.trade.findMany({
      where: { userId, status: TradeStatus.closed },
      orderBy: { exitDate: 'asc' },
      select: { exitDate: true, netPnl: true },
    });

    let runningPnl = 0;
    return trades.map(t => {
      runningPnl += Number(t.netPnl) || 0;
      return {
        date: t.exitDate,
        pnl: Math.round(runningPnl * 100) / 100,
      };
    });
  }

  async getPerformanceStats(userId: string) {
    const trades = await prisma.trade.findMany({
      where: { userId, status: TradeStatus.closed },
    });

    const setupStats: Record<string, any> = {};
    const symbolStats: Record<string, any> = {};
    const dayStats: Record<string, any> = {};
    const sessionStats: Record<string, any> = {};
    const emotionStats: Record<string, any> = {};

    trades.forEach(t => {
      const pnl = Number(t.netPnl) || 0;
      const setup = t.setupType || 'Untagged';
      const symbol = t.symbol;
      const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(t.entryDate);
      const session = t.session || 'Unknown';
      const emotion = t.emotionalStateEntry || 'Neutral';

      const updateRef = (ref: any, key: string) => {
        if (!ref[key]) {
          ref[key] = { name: key, total: 0, wins: 0, losses: 0, pnl: 0 };
        }
        ref[key].total++;
        ref[key].pnl += pnl;
        if (pnl > 0) ref[key].wins++;
        else ref[key].losses++;
      };

      updateRef(setupStats, setup);
      updateRef(symbolStats, symbol);
      updateRef(dayStats, day);
      updateRef(sessionStats, session);
      updateRef(emotionStats, emotion);
    });

    const finalize = (stats: any) => Object.values(stats).map((s: any) => ({
      ...s,
      winRate: Math.round((s.wins / s.total) * 100),
      pnl: Math.round(s.pnl * 100) / 100,
    })).sort((a, b) => b.pnl - a.pnl);

    return {
      bySetup: finalize(setupStats),
      bySymbol: finalize(symbolStats),
      byDay: finalize(dayStats),
      bySession: finalize(sessionStats),
      byEmotion: finalize(emotionStats),
    };
  }

  async getRiskMetrics(userId: string) {
    const trades = await prisma.trade.findMany({
      where: { userId, status: TradeStatus.closed },
      orderBy: { exitDate: 'asc' },
    });

    if (trades.length === 0) return { maxDrawdown: 0, currentStreak: 0, maxWinStreak: 0, maxLossStreak: 0 };

    let peak = 0;
    let runningPnl = 0;
    let maxDrawdown = 0;

    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let streakType: 'win' | 'loss' | null = null;

    trades.forEach(t => {
      const pnl = Number(t.netPnl) || 0;
      runningPnl += pnl;

      // Drawdown
      if (runningPnl > peak) peak = runningPnl;
      const dd = peak - runningPnl;
      if (dd > maxDrawdown) maxDrawdown = dd;

      // Streaks
      if (pnl > 0) {
        if (streakType === 'win') {
          currentStreak++;
        } else {
          currentStreak = 1;
          streakType = 'win';
        }
        if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
      } else if (pnl < 0) {
        if (streakType === 'loss') {
          currentStreak++;
        } else {
          currentStreak = 1;
          streakType = 'loss';
        }
        if (currentStreak > maxLossStreak) maxLossStreak = currentStreak;
      }
    });

    return {
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      currentStreak: streakType === 'win' ? currentStreak : -currentStreak,
      maxWinStreak,
      maxLossStreak,
    };
  }

  async getPropFirmStats(userId: string) {
    const activeAccount = await prisma.tradingAccount.findFirst({
      where: { userId, isActive: true },
    });

    if (!activeAccount) return null;

    const trades = await prisma.trade.findMany({
      where: { userId, accountId: activeAccount.id, status: TradeStatus.closed },
      orderBy: { exitDate: 'asc' },
    });

    const initialBalance = Number(activeAccount.initialBalance) || 100000;
    let runningPnl = 0;
    let maxPnl = 0;
    let todayPnl = 0;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const profits: number[] = [];

    trades.forEach(t => {
      const pnl = Number(t.netPnl) || 0;
      runningPnl += pnl;
      if (runningPnl > maxPnl) maxPnl = runningPnl;

      if (t.exitDate && t.exitDate >= startOfToday) {
        todayPnl += pnl;
      }

      if (pnl > 0) profits.push(pnl);
    });

    const currentDrawdown = maxPnl - runningPnl;
    const totalProfit = trades.filter(t => (Number(t.netPnl) || 0) > 0).reduce((sum, t) => sum + (Number(t.netPnl) || 0), 0);
    
    const bestTrade = profits.length > 0 ? Math.max(...profits) : 0;
    const consistencyScore = totalProfit > 0 ? (bestTrade / totalProfit) * 100 : 0;

    const rules = (activeAccount.propFirmRules as any) || {};

    return {
      accountName: activeAccount.name,
      initialBalance,
      currentBalance: initialBalance + runningPnl,
      todayPnl: Math.round(todayPnl * 100) / 100,
      currentDrawdown: Math.round(currentDrawdown * 100) / 100,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      dailyLossLimit: rules.dailyLossLimit || initialBalance * 0.05,
      maxDrawdownLimit: rules.maxDrawdownLimit || initialBalance * 0.10,
    };
  }
}

export const analyticsService = new AnalyticsService();
