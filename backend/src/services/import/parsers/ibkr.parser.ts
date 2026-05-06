import { IBrokerParser, RawTrade } from './parser.interface';
import Papa from 'papaparse';
import { AssetClass, TradeDirection } from '@prisma/client';

export class IBKRParser implements IBrokerParser {
  name = 'interactive_brokers';

  async parse(csvContent: string): Promise<RawTrade[]> {
    const results = Papa.parse(csvContent, {
      skipEmptyLines: true,
      header: false,
    });

    const trades: RawTrade[] = [];
    const rows = results.data as string[][];

    // IBKR CSV has multiple sections. We look for "Trades,Data"
    // Format: Trades,Data,Order,Stocks,USD,AAPL,2023-10-01 10:00:00,,100,150.00,155.00, ...
    for (const row of rows) {
      if (row[0] === 'Trades' && row[1] === 'Data' && row[2] === 'Order') {
        const assetClass = this.mapAssetClass(row[3] || '');
        const symbol = row[5] || '';
        const dateTimeStr = row[6] || '';
        const quantity = parseFloat(row[8] || '0');
        const price = parseFloat(row[9] || '0');
        const commission = Math.abs(parseFloat(row[11] || '0'));
        const externalId = row[15]; // Execution ID or similar

        const date = new Date(dateTimeStr);
        
        // In IBKR Activity Statement, individual executions are listed.
        // We aggregate or treat them as individual legs.
        // For simplicity in Phase 1, we map each "Data,Order" row as a raw trade entry
        // that our service will then reconcile into higher-level Trade models.
        
        trades.push({
          symbol,
          assetClass,
          direction: quantity > 0 ? TradeDirection.long : TradeDirection.short,
          entryDate: date,
          quantity: Math.abs(quantity),
          entryPrice: price,
          commission,
          externalId,
        });
      }
    }

    return trades;
  }

  private mapAssetClass(ibkrClass: string): AssetClass {
    switch (ibkrClass.toUpperCase()) {
      case 'STOCKS': return AssetClass.stocks;
      case 'FOREX': return AssetClass.forex;
      case 'FUTURES': return AssetClass.futures;
      case 'OPTIONS': return AssetClass.options;
      case 'CRYPTO': return AssetClass.crypto;
      default: return AssetClass.other;
    }
  }
}
