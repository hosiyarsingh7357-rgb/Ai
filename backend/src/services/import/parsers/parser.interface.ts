import { AssetClass, TradeDirection } from '@prisma/client';

export interface RawTrade {
  symbol: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  entryDate: Date;
  exitDate?: Date;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  commission?: number;
  externalId?: string; // Broker's original trade ID to prevent duplicates
}

export interface IBrokerParser {
  name: string;
  parse(csvContent: string): Promise<RawTrade[]>;
}
