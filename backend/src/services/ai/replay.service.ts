import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export class ReplayService {
  /**
   * Generates simulated OHLC data for a trade.
   * This is used when real historical data isn't available.
   * It creates a "plausible" price curve between entry and exit.
   */
  async generateSimulationData(tradeId: string) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { 
        legs: true,
        playbook: true
      }
    });

    if (!trade) throw new Error('Trade not found');

    const entryDate = new Date(trade.entryDate);
    // If trade is still open, use current time; otherwise use exitDate
    const exitDate = trade.exitDate ? new Date(trade.exitDate) : new Date(Date.now());
    
    // We want about 120 bars for a smooth replay
    const durationMs = exitDate.getTime() - entryDate.getTime();
    // Minimum 1-minute interval, or spread the duration over 120 bars
    const intervalMs = Math.max(60 * 1000, Math.floor(durationMs / 120));
    const steps = Math.ceil(durationMs / intervalMs);
    
    const bars: { time: number; open: number; high: number; low: number; close: number }[] = [];
    let currentPrice = Number(trade.entryPrice);
    const targetPrice = trade.exitPrice ? Number(trade.exitPrice) : currentPrice;
    
    // Pre-calculate drift to ensure we generally head towards the target price
    const driftPerStep = (targetPrice - currentPrice) / steps;
    // Volatility: 0.1% of entry price per step, adjusted by steps
    const volatility = currentPrice * 0.001;

    for (let i = 0; i <= steps; i++) {
      const time = new Date(entryDate.getTime() + i * intervalMs);
      
      // Random walk with drift
      const random = (Math.random() - 0.5) * 2;
      const change = driftPerStep + (random * volatility);
      
      const open = i === 0 ? currentPrice : bars[i-1]!.close;
      const close = open + change;
      
      // High/Low needs to contain Open/Close
      const noise = Math.random() * volatility * 0.5;
      const high = Math.max(open, close) + noise;
      const low = Math.min(open, close) - noise;
      
      bars.push({
        time: Math.floor(time.getTime() / 1000), // UNIX timestamp for lightweight-charts
        open: Number(open.toFixed(8)),
        high: Number(high.toFixed(8)),
        low: Number(low.toFixed(8)),
        close: Number(close.toFixed(8))
      });
    }

    return {
      trade: {
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.direction,
        entryPrice: Number(trade.entryPrice),
        exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
        stopLoss: trade.stopLoss ? Number(trade.stopLoss) : null,
        takeProfit: trade.takeProfit ? Number(trade.takeProfit) : null,
        setupType: trade.setupType,
        netPnl: trade.netPnl ? Number(trade.netPnl) : 0,
      },
      bars
    };
  }

  /**
   * Uses Gemini to generate timestamped annotations for the trade replay.
   */
  async generateReplayInsights(trade: any, bars: any[]) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Sample bars for the prompt to keep it efficient
    const sampledBars = bars.filter((_, i) => i % 15 === 0 || i === bars.length - 1);
    
    const prompt = `
      You are an Elite Trading Coach analyzing a trade replay for a student.
      
      TRADE DATA:
      Symbol: ${trade.symbol}
      Direction: ${trade.direction}
      Entry Price: ${trade.entryPrice}
      Exit Price: ${trade.exitPrice || 'Still Open'}
      Setup: ${trade.setupType || 'None specified'}
      P&L: ${trade.netPnl}
      
      PRICE ACTION SUMMARY (Timestamped Samples):
      ${JSON.stringify(sampledBars)}
      
      TASK: 
      Generate 3 to 5 "Replay Insights". Each insight must be attached to a specific timestamp from the data above.
      Tell the trader what they should have noticed in the price action at that moment (e.g. momentum shift, support hold, over-extended).
      
      OUTPUT FORMAT:
      Return ONLY a JSON array of objects:
      [
        { "time": number (the UNIX timestamp), "insight": "string", "type": "positive" | "warning" | "neutral" }
      ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract code block if present
      const jsonStr = text.includes('```json') 
        ? text.split('```json')[1]?.split('```')[0]?.trim() || text.trim()
        : text.includes('```')
          ? text.split('```')[1]?.split('```')[0]?.trim() || text.trim()
          : text.trim();

      const insights = JSON.parse(jsonStr);
      return Array.isArray(insights) ? insights : [];
    } catch (error) {
      console.error('Error generating replay insights:', error);
      return [];
    }
  }
}
