import { IBKRParser } from './parsers/ibkr.parser';
import { MT4Parser } from './parsers/mt4.parser';
import { WebullParser } from './parsers/webull.parser';
import { SchwabParser } from './parsers/schwab.parser';
import { IBrokerParser, RawTrade } from './parsers/parser.interface';
import { PrismaClient, TradeStatus } from '@prisma/client';
import { groupExecutionsIntoTrades } from './trade-grouper';

const prisma = new PrismaClient();

export class ImportService {
  private parsers: Record<string, IBrokerParser> = {
    ibkr: new IBKRParser(),
    mt4: new MT4Parser(),
    webull: new WebullParser(),
    schwab: new SchwabParser(),
  };

  async importTrades(userId: string, accountId: string, brokerType: string, csvContent: string) {
    const parser = this.parsers[brokerType];
    if (!parser) {
      throw new Error(`Unsupported broker: ${brokerType}`);
    }

    let rawTrades = await parser.parse(csvContent);
    
    // For specific brokers known for execution-based exports, reconcile into unified trades
    if (['webull', 'ibkr', 'interactive_brokers'].includes(brokerType)) {
      rawTrades = groupExecutionsIntoTrades(rawTrades);
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const raw of rawTrades) {
      // Check for duplicate via externalId
      if (raw.externalId) {
        const existing = await prisma.trade.findFirst({
          where: {
            userId,
            externalId: raw.externalId,
          },
        });
        if (existing) {
          skippedCount++;
          continue;
        }
      }

      // Create the trade
      // Note: This is an individual execution. For single-entry trades (MT4), it's perfect.
      // For multi-execution trades (IBKR), we might need a reconciliation layer later (Phase 3).
      await prisma.trade.create({
        data: {
          userId,
          accountId,
          symbol: raw.symbol,
          assetClass: raw.assetClass,
          direction: raw.direction,
          entryDate: raw.entryDate,
          exitDate: raw.exitDate,
          entryPrice: raw.entryPrice,
          exitPrice: raw.exitPrice,
          quantity: raw.quantity,
          commission: raw.commission || 0,
          status: raw.exitPrice ? TradeStatus.closed : TradeStatus.open,
          externalId: raw.externalId,
          importSource: `${parser.name}_csv`,
        },
      });
    }

    return {
      total: rawTrades.length,
      imported: rawTrades.length - skippedCount,
      skipped: skippedCount,
    };
  }

  async previewImport(brokerType: string, csvContent: string) {
    const parser = this.parsers[brokerType];
    if (!parser) {
      throw new Error(`Unsupported broker: ${brokerType}`);
    }

    let rawTrades = await parser.parse(csvContent);
    
    // Group if applicable
    if (['webull', 'ibkr', 'interactive_brokers'].includes(brokerType)) {
      rawTrades = groupExecutionsIntoTrades(rawTrades);
    }

    return {
      total: rawTrades.length,
      trades: rawTrades.slice(0, 50), // Send first 50 for preview
    };
  }
}

export const importService = new ImportService();
