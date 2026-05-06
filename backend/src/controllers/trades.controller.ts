import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import * as tradesService from '../services/trades/trades.service.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

export const listTrades = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  const result = await tradesService.listTrades(userId, req.query as never)
  ApiResponse.success(res, result.trades, result.meta)
})

export const getTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  const trade = await tradesService.getTradeById(req.params['id']!, userId)
  ApiResponse.success(res, trade)
})

export const createTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  const trade = await tradesService.createTrade(userId, req.body)
  ApiResponse.created(res, trade)
})

export const updateTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  const trade = await tradesService.updateTrade(req.params['id']!, userId, req.body)
  ApiResponse.success(res, trade)
})

export const deleteTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  await tradesService.deleteTrade(req.params['id']!, userId)
  ApiResponse.noContent(res)
})
