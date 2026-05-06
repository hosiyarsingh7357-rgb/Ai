import { BaseBrokerAdapter, BrokerTrade } from './base.adapter.js';

export class MockBrokerAdapter extends BaseBrokerAdapter {
  async validate(): Promise<boolean> {
    return true;
  }

  async fetchTrades(startDate: Date, endDate: Date): Promise<BrokerTrade[]> {
    // Simulate fetching from an API
    return [
      {
        externalId: `mock_${Date.now()}_1`,
        symbol: 'TSLA',
        direction: 'long',
        quantity: 10,
        entryPrice: 175.50,
        exitPrice: 182.20,
        entryDate: new Date(Date.now() - 86400000), // Yesterday
        exitDate: new Date(Date.now() - 82800000),
        netPnl: 67.00,
        commission: 0.50
      },
      {
        externalId: `mock_${Date.now()}_2`,
        symbol: 'NVDA',
        direction: 'long',
        quantity: 5,
        entryPrice: 850.00,
        exitPrice: 875.00,
        entryDate: new Date(Date.now() - 43200000), // 12h ago
        exitDate: new Date(Date.now() - 36000000),
        netPnl: 125.00,
        commission: 1.00
      }
    ];
  }
}
