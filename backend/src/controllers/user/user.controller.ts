import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as userService from '../../services/user/user.service.js'

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserProfile((req as any).user.id)
  res.json({ status: 'success', data: user })
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile((req as any).user.id, req.body)
  res.json({ status: 'success', data: user })
})

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await userService.updateSettings((req as any).user.id, req.body)
  res.json({ status: 'success', data: settings })
})

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount((req as any).user.id)
  // Clear cookies
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.status(204).json({ status: 'success', data: null })
})
