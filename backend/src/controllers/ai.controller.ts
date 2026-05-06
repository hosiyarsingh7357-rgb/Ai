import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { aiService } from '../services/ai/ai.service';
import { reportService } from '../services/ai/report.service';
import { ReplayService } from '../services/ai/replay.service';

const replayService = new ReplayService();

export const analyzeTrade = asyncHandler(async (req: Request, res: Response) => {
  const { tradeId } = req.params as { tradeId: string };
  const analysis = await aiService.analyzeTrade(tradeId);
  res.status(200).json(analysis);
});

export const getWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const report = await aiService.generateWeeklyReport(userId);
  res.status(200).json(report);
});

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const reports = await reportService.getUserReports(userId);
  res.status(200).json(reports);
});

export const getReportDetail = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const report = await reportService.getReportById(id, userId);
  
  if (!report) {
    res.status(404).json({ message: 'Report not found' });
    return;
  }

  res.status(200).json(report);
});

export const coachChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ message: 'Message is required' });
    return;
  }

  const response = await aiService.generateCoachResponse(userId, message, history);
  res.status(200).json({ response });
});

export const getTradeReplay = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = await replayService.generateSimulationData(id);
  const insights = await replayService.generateReplayInsights(data.trade, data.bars);
  
  res.status(200).json({
    ...data,
    insights
  });
});
