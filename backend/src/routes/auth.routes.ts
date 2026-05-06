import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  onboardingSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation.js'

import { loginRateLimiter } from '../middleware/rateLimiter.middleware.js'

const router = Router()

// POST /v1/auth/register
router.post('/register', loginRateLimiter, validate(registerSchema), authController.register)

// POST /v1/auth/login
router.post('/login', loginRateLimiter, validate(loginSchema), authController.login)

// POST /v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refresh)

// POST /v1/auth/logout
router.post('/logout', authenticate, authController.logout)

// GET /v1/auth/me
router.get('/me', authenticate, authController.getMe)

// POST /v1/auth/onboarding
router.post(
  '/onboarding',
  authenticate,
  validate(onboardingSchema),
  authController.completeOnboarding
)

// POST /v1/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)

// POST /v1/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

export default router
