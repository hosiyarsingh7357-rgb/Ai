import { IBrokerParser, RawTrade } from './parser.interface';
import Papa from 'papaparse';
import { AssetClass, TradeDirection } from '@prisma/client';

export class MT4Parser implements IBrokerParser {
  name = 'metatrader';

  async parse(csvContent: string): Promise<RawTrade[]> {
    const results = Papa.parse(csvContent, {
      skipEmptyLines: true,
      header: true,
    });

    const trades: RawTrade[] = [];
    const rows = results.data as any[];

    for (const row of rows) {
      // MT4 CSV headers vary, but commonly: Ticket, Open Time, Type, Size, Item, Open Price, S/L, T/P, Close Time, Close Price, Commission, Taxes, Swap, Profit
      const symbol = row['Item'] || row['Symbol'];
      const openTime = row['Open Time'];
      const closeTime = row['Close Time'];
      const type = row['Type']; // buy or sell
      const size = parseFloat(row['Size'] || row['Volume']);
      const openPrice = parseFloat(row['Open Price']);
      const closePrice = parseFloat(row['Close Price']);
      const commission = Math.abs(parseFloat(row['Commission'] || '0'));
      const externalId = row['Ticket'];

      if (!symbol || !openTime) continue;

      trades.push({
        symbol,
        assetClass: AssetClass.forex, // MT4 is mostly Forex/CFD
        direction: type?.toLowerCase() === 'buy' ? TradeDirection.long : TradeDirection.short,
        entryDate: new Date(openTime),
        exitDate: closeTime ? new Date(closeTime) : undefined,
        quantity: size,
        entryPrice: openPrice,
        exitPrice: closePrice,
        commission,
        externalId,
      });
    }

    return trades;
  }
}
