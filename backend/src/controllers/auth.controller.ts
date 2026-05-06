import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import * as authService from '../services/auth/auth.service.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body)
  ApiResponse.created(res, result)
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body)
  ApiResponse.success(res, result)
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshTokens(req.body.refreshToken)
  ApiResponse.success(res, result)
})

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Stateless JWT — client drops tokens. Optionally add to blocklist via Redis.
  ApiResponse.message(res, 'Logged out successfully')
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe((req as AuthRequest).user.id)
  ApiResponse.success(res, user)
})

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id
  const result = await authService.completeOnboarding(userId, req.body)
  ApiResponse.success(res, result)
})
