import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BacktestService {
  async createSession(userId: string, data: any) {
    return prisma.backtestSession.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getSessions(userId: string) {
    return prisma.backtestSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        playbook: {
          select: { name: true }
        }
      }
    });
  }

  async getSessionDetails(userId: string, sessionId: string) {
    return prisma.backtestSession.findUnique({
      where: { id: sessionId, userId },
      include: {
        trades: {
          orderBy: { createdAt: 'asc' }
        },
        playbook: true
      }
    });
  }

  async addTrade(sessionId: string, userId: string, tradeData: any) {
    // Verify session ownership
    const session = await prisma.backtestSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const trade = await prisma.backtestTrade.create({
      data: {
        ...tradeData,
        sessionId,
      }
    });

    // Update session aggregates
    const trades = await prisma.backtestTrade.findMany({
      where: { sessionId }
    });

    const totalTrades = trades.length;
    const wins = trades.filter(t => Number(t.pnl) > 0).length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const netPnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0);

    await prisma.backtestSession.update({
      where: { id: sessionId },
      data: {
        totalTrades,
        winRate,
        netPnl
      }
    });

    return trade;
  }

  async deleteSession(userId: string, sessionId: string) {
    return prisma.backtestSession.deleteMany({
      where: { id: sessionId, userId }
    });
  }
}

export const backtestService = new BacktestService();
