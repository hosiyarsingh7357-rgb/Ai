import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as tradingAccountService from '../../services/trading-accounts/trading-accounts.service.js'

export const getTradingAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await tradingAccountService.listTradingAccounts((req as any).user.id)
  res.json({ status: 'success', data: accounts })
})

export const getTradingAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await tradingAccountService.getTradingAccountById(req.params.id!, (req as any).user.id)
  res.json({ status: 'success', data: account })
})

export const createTradingAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await tradingAccountService.createTradingAccount((req as any).user.id, req.body)
  res.status(201).json({ status: 'success', data: account })
})

export const updateTradingAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await tradingAccountService.updateTradingAccount(req.params.id!, (req as any).user.id, req.body)
  res.json({ status: 'success', data: account })
})

export const deleteTradingAccount = asyncHandler(async (req: Request, res: Response) => {
  await tradingAccountService.deleteTradingAccount(req.params.id!, (req as any).user.id)
  res.status(204).json({ status: 'success', data: null })
})
