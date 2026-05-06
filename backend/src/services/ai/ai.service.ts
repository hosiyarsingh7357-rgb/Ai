import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../config/database.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export class AIService {
  private getModel(tier: string) {
    return tier === 'elite' ? proModel : flashModel;
  }

  async analyzeTrade(tradeId: string) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { 
        journalNotes: true,
        account: true,
        user: true,
      }
    });

    if (!trade) throw new Error('Trade not found');

    const model = this.getModel(trade.user.subscriptionTier);

    const prompt = `
      You are a professional trading performance coach. 
      Analyze the following trade execution and provide constructive feedback.
      ${trade.user.subscriptionTier === 'elite' ? 'As an Elite Strategist Coach, provide deep technical and psychological analysis.' : ''}
      
      TRADE DATA:
      Symbol: ${trade.symbol}
      Direction: ${trade.direction}
      Entry: ${trade.entryPrice}
      Exit: ${trade.exitPrice}
      Net P&L: ${trade.netPnl}
      Notes: ${trade.notes || 'None provided'}
      
      TASK:
      1. Identify potential behavioral mistakes (FOMO, Overleveraging, Revenge Trading, etc).
      2. Suggest one improvement for the next trade.
      3. Rate the discipline levels based on notes.
      4. Provide a "Strategy Edge" score (how well the setup matches technical logic).
      
      Respond in valid JSON format only with keys: "mistakes" (array), "suggestion" (string), "disciplineScore" (1-10), "strategyEdge" (1-10), "summary" (string).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if Gemini wraps it in markdown blocks
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(jsonStr);

    // Save to DB
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        aiAnalysis: analysis,
        aiAnalyzedAt: new Date()
      }
    });

    return analysis;
  }

  async generateWeeklyReport(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const trades = await prisma.trade.findMany({
      where: {
        userId,
        status: 'closed',
        exitDate: { gte: lastWeek }
      },
      select: {
        symbol: true,
        direction: true,
        netPnl: true,
        setupType: true,
        notes: true
      }
    });

    if (trades.length === 0) {
      return { summary: "No trades closed this week to analyze." };
    }

    const tradeStats = trades.map(t => ({
      s: t.symbol,
      d: t.direction,
      p: t.netPnl,
      st: t.setupType,
      n: t.notes
    }));

    const model = this.getModel(user.subscriptionTier);

    const prompt = `
      You are a professional trading psychologist and performance analyst. 
      Review this week's trading performance for a user.
      ${user.subscriptionTier === 'elite' ? 'As an Elite Coach, identify deep psychological recursive patterns and suggest professional-grade risk adjustments.' : ''}
      
      WEEKLY DATA (Simplified):
      ${JSON.stringify(tradeStats)}
      
      TASK:
      1. Summarize overall week performance.
      2. Identify the "Trade of the Week" (best or most disciplined).
      3. Identify recursive errors or psychological patterns.
      4. Suggest a focus for next week.
      
      Respond in valid JSON format only with keys: 
      "performanceOverview" (string), 
      "tradeOfTheWeek" (string), 
      "patternDetection" (string), 
      "nextWeekFocus" (string).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  }

  async generateCoachResponse(userId: string, userMessage: string, history: any[] = []) {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { tradingAccounts: true }
    });
    
    if (!user) throw new Error('User not found');
    if (user.subscriptionTier !== 'elite') {
       throw new Error('AI Coach Chat is an Elite-only feature.');
    }

    // Fetch last 30 trades for context
    const recentTrades = await prisma.trade.findMany({
      where: { userId, status: 'closed' },
      orderBy: { exitDate: 'desc' },
      take: 30,
      select: {
        symbol: true,
        direction: true,
        netPnl: true,
        entryDate: true,
        exitDate: true,
        setupType: true,
        mistakes: true,
        notes: true,
        rating: true
      }
    });

    const tradeContext = recentTrades.map(t => ({
      sym: t.symbol,
      dir: t.direction,
      pnl: t.netPnl,
      setup: t.setupType,
      mistakes: t.mistakes,
      rating: t.rating,
      notes: t.notes?.substring(0, 100)
    }));

    const systemPrompt = `
      You are the "EdgeLog Nexus AI Coach", a top-tier trading performance psychologist and quantitative analyst. 
      Your goal is to help the trader find their "Edge" and eliminate "Noise".
      
      TRADER PROFILE:
      Name: ${user.name}
      Experience: ${user.tradingExperience}
      Primary Asset: ${user.primaryAssetClass}
      
      RECENT PERFORMANCE DATA (Last 30 trades):
      ${JSON.stringify(tradeContext)}
      
      INSTRUCTIONS:
      1. Always be professional, direct, and data-driven.
      2. If the trader asks about their performance, refer to the RECENT PERFORMANCE DATA provided.
      3. Focus on behavioral patterns (FOMO, revenge trading, discipline) and risk management.
      4. Use a supportive but firm "high-performance coach" tone.
      5. Keep responses concise but impactful. Use markdown for structure.
      6. If you detect a streak of losses, offer a "Decompression Strategy".
      7. Mention specific symbols or setups from their data when relevant.
    `;

    const chat = proModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Understood. I am now the EdgeLog Nexus AI Coach, ready to analyze patterns and optimize performance. How can I assist you today?" }] },
        ...history
      ]
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Optionally save this interaction as an insight
    await prisma.aiInsight.create({
      data: {
        userId,
        insightType: 'coach_chat',
        title: `Chat: ${userMessage.substring(0, 50)}...`,
        content: text,
        geminiModel: 'gemini-1.5-pro',
      }
    });

    return text;
  }
}

export const aiService = new AIService();
