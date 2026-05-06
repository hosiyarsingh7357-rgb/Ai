import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/environment.js'
import prisma from '../config/database.js'
import type { User } from '@prisma/client'

export interface AuthRequest extends Request {
  user: User
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized())
  }

  const token = authHeader.split(' ')[1]
  if (!token) return next(ApiError.unauthorized())

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) return next(ApiError.unauthorized('User not found'))

    ;(req as AuthRequest).user = user
    next()
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'))
  }
}
