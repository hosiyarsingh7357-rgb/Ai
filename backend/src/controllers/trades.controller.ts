import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import * as tradesService from '../services/trades/trades.service.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import { notifyUser } from '../services/websocket.service.js'

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
  
  // Notify client via WebSocket
  notifyUser(userId, 'TRADE_UPDATED', { tradeId: trade.id, action: 'CREATE' })
  
  ApiResponse.created(res, trade)
})

export const updateTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  const trade = await tradesService.updateTrade(req.params['id']!, userId, req.body)
  
  // Notify client via WebSocket
  notifyUser(userId, 'TRADE_UPDATED', { tradeId: trade.id, action: 'UPDATE' })
  
  ApiResponse.success(res, trade)
})

export const deleteTrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  await tradesService.deleteTrade(req.params['id']!, userId)
  
  // Notify client via WebSocket
  notifyUser(userId, 'TRADE_UPDATED', { tradeId: req.params['id'], action: 'DELETE' })
  
  ApiResponse.noContent(res)
})
