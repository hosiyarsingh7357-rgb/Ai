import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import * as authService from '../services/auth/auth.service.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}

const setTokensCookie = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 }) // 15m
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body)
  setTokensCookie(res, result.accessToken, result.refreshToken)
  ApiResponse.created(res, result)
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body)
  setTokensCookie(res, result.accessToken, result.refreshToken)
  ApiResponse.success(res, result)
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken
  const result = await authService.refreshTokens(refreshToken)
  setTokensCookie(res, result.accessToken, result.refreshToken)
  ApiResponse.success(res, result)
})

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
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

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email)
  ApiResponse.message(res, 'If an account exists with that email, a reset link has been sent.')
})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password)
  ApiResponse.message(res, 'Password has been reset successfully.')
})
