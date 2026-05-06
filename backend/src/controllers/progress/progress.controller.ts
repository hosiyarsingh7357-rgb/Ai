import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as progressService from '../../services/progress/progress.service.js'

export const listGoals = asyncHandler(async (req: Request, res: Response) => {
  const goals = await progressService.listProgressGoals((req as any).user.id)
  res.json({ status: 'success', data: goals })
})

export const createGoal = asyncHandler(async (req: Request, res: Response) => {
  const goal = await progressService.createProgressGoal((req as any).user.id, req.body)
  res.status(201).json({ status: 'success', data: goal })
})

export const updateGoal = asyncHandler(async (req: Request, res: Response) => {
  const goal = await progressService.updateProgressGoal(req.params.id!, (req as any).user.id, req.body)
  res.json({ status: 'success', data: goal })
})

export const deleteGoal = asyncHandler(async (req: Request, res: Response) => {
  await progressService.deleteProgressGoal(req.params.id!, (req as any).user.id)
  res.status(204).json({ status: 'success', data: null })
})
