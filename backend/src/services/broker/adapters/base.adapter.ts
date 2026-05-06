export interface BrokerTrade {
  externalId: string;
  symbol: string;
  direction: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  entryDate: Date;
  exitDate: Date;
  netPnl: number;
  commission: number;
}

export abstract class BaseBrokerAdapter {
  constructor(protected credentials: any) {}
  abstract validate(): Promise<boolean>;
  abstract fetchTrades(startDate: Date, endDate: Date): Promise<BrokerTrade[]>;
}
