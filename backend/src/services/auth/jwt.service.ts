import jwt from 'jsonwebtoken'
import { env } from '../../config/environment.js'

export interface AccessTokenPayload {
  sub: string   // user id
  email: string
  tier: string
}

export interface RefreshTokenPayload {
  sub: string
  type: 'refresh'
}

export interface ResetTokenPayload {
  sub: string
  email: string
  type: 'reset'
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' } satisfies RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  )
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}

export function signResetToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: 'reset' } satisfies ResetTokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' } as jwt.SignOptions
  )
}

export function verifyResetToken(token: string): ResetTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as ResetTokenPayload
  if (payload.type !== 'reset') {
    throw new Error('Invalid token type')
  }
  return payload
}
