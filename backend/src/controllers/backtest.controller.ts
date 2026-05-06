import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { backtestService } from '../services/backtest/backtest.service';

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const session = await backtestService.createSession(userId, req.body);
  res.status(201).json(session);
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const sessions = await backtestService.getSessions(userId);
  res.status(200).json(sessions);
});

export const getSessionDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const session = await backtestService.getSessionDetails(userId, id);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  res.status(200).json(session);
});

export const addTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const trade = await backtestService.addTrade(id, userId, req.body);
  res.status(201).json(trade);
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  await backtestService.deleteSession(userId, id);
  res.status(204).send();
});
