import prisma from '../../config/database.js'
import { hashPassword, comparePassword } from './password.service.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.service.js'
import { ApiError } from '../../utils/ApiError.js'
import type { RegisterInput, LoginInput } from '../../validations/auth.validation.js'
import type { User } from '@prisma/client'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: Omit<User, 'passwordHash'>
}

function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user
  return safe
}

export async function registerUser(input: RegisterInput): Promise<AuthTokens> {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw ApiError.conflict('An account with this email already exists')
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      // Create default settings
      userSettings: {
        create: {},
      },
    },
  })

  const tokens = generateTokens(user)
  return { ...tokens, user: sanitizeUser(user) }
}

export async function loginUser(input: LoginInput): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })

  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const isValid = await comparePassword(input.password, user.passwordHash)
  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const tokens = generateTokens(user)
  return { ...tokens, user: sanitizeUser(user) }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) throw ApiError.unauthorized('User not found')

  const tokens = generateTokens(user)
  return { ...tokens, user: sanitizeUser(user) }
}

export async function getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSettings: true, tradingAccounts: true },
  })
  if (!user) throw ApiError.notFound('User')
  return sanitizeUser(user)
}

export async function completeOnboarding(
  userId: string,
  input: any // Using any here to avoid cyclic dependency with validation types if they aren't exported cleanly
): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      defaultCurrency: input.currency,
      tradingExperience: (input.experienceLevel || input.tradingExperience)?.toLowerCase() as any,
      tradingStyle: input.tradingStyle?.toLowerCase() as any,
      riskPerTrade: input.riskPerTrade,
      primaryAssetClass: (input.primaryAssets && input.primaryAssets.length > 1 
        ? 'mixed' 
        : input.primaryAssets?.[0]?.toLowerCase()) as any,
      tradingAccounts: {
        create: {
          name: input.accountName,
          currency: input.currency,
          currentBalance: input.initialBalance,
          initialBalance: input.initialBalance,
        },
      },
    },
    include: { userSettings: true, tradingAccounts: true },
  })

  return sanitizeUser(user)
}

function generateTokens(user: User): Omit<AuthTokens, 'user'> {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    tier: user.subscriptionTier,
  })
  const refreshToken = signRefreshToken(user.id)
  return { accessToken, refreshToken, expiresIn: 15 * 60 } // 15 minutes in seconds
}
