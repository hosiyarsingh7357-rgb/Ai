import prisma from '../../config/database.js';
import { encrypt, decrypt } from '../../utils/encryption.js';
import { MockBrokerAdapter } from './adapters/mock.adapter.js';
import { TradeStationAdapter } from './adapters/tradestation.adapter.js';

export class BrokerService {
  async listConnections(userId: string) {
    return prisma.brokerConnection.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addConnection(userId: string, data: { broker: string; connectionType: string; credentials: any; accountId?: string }) {
    const encryptedCreds = encrypt(JSON.stringify(data.credentials));

    return prisma.brokerConnection.create({
      data: {
        userId,
        broker: data.broker,
        connectionType: data.connectionType,
        encryptedCreds,
        accountId: data.accountId,
        status: 'active'
      }
    });
  }

  async deleteConnection(userId: string, connectionId: string) {
    return prisma.brokerConnection.deleteMany({
      where: { id: connectionId, userId }
    });
  }

  async triggerSync(userId: string, connectionId: string) {
    const connection = await prisma.brokerConnection.findFirst({
      where: { id: connectionId, userId },
      include: { account: true, user: true }
    });

    if (!connection) throw new Error('Connection not found');
    if (connection.user.subscriptionTier !== 'elite') throw new Error('Elite subscription required for auto-sync');
    if (!connection.accountId) throw new Error('No trading account linked to this connection');

    const credentials = JSON.parse(decrypt(connection.encryptedCreds || ''));
    
    let trades: any[] = [];
    
    // Adapter Selection
    const brokerKey = connection.broker.toLowerCase();
    if (brokerKey === 'mock') {
      const adapter = new MockBrokerAdapter(credentials);
      trades = await adapter.fetchTrades(new Date(0), new Date());
    } else if (brokerKey === 'tradestation') {
      const adapter = new TradeStationAdapter(credentials);
      trades = await adapter.fetchTrades(new Date(0), new Date());
    }

    if (trades.length > 0) {
      await this.processIncomingTrades(userId, connection.accountId, trades);
    }

    // Update last sync time
    await prisma.brokerConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() }
    });

    return { 
      message: `Sync successful for ${connection.broker}.`,
      tradesImported: trades.length 
    };
  }

  // Helper to map broker data to our Trade model
  private async processIncomingTrades(userId: string, accountId: string, brokerTrades: any[]) {
    // Logic to avoid duplicates using externalId
    for (const bt of brokerTrades) {
      const existing = await prisma.trade.findFirst({
        where: { userId, externalId: bt.externalId }
      });

      if (!existing) {
        await prisma.trade.create({
          data: {
            userId,
            accountId,
            symbol: bt.symbol,
            assetClass: 'stocks', // Default or derived
            direction: bt.direction,
            entryDate: bt.entryDate,
            exitDate: bt.exitDate,
            entryPrice: bt.entryPrice,
            exitPrice: bt.exitPrice,
            quantity: bt.quantity,
            netPnl: bt.netPnl,
            commission: bt.commission,
            externalId: bt.externalId,
            importSource: 'broker_sync'
          }
        });
      }
    }
  }
}

export const brokerService = new BrokerService();
