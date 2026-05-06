import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { analyticsService } from '../services/analytics/analytics.service';

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const overview = await analyticsService.getOverview(userId);
  res.status(200).json(overview);
});

export const getEquityCurve = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const curve = await analyticsService.getEquityCurve(userId);
  res.status(200).json(curve);
});

export const getPerformanceStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const stats = await analyticsService.getPerformanceStats(userId);
  res.status(200).json(stats);
});

export const getRiskMetrics = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const metrics = await analyticsService.getRiskMetrics(userId);
  res.status(200).json(metrics);
});

export const getPropFirmStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const stats = await analyticsService.getPropFirmStats(userId);
  res.status(200).json(stats);
});
