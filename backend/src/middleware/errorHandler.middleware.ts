import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/environment.js'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Known API errors (our own)
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.toJSON(),
    })
    return
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {}
    for (const issue of err.issues) {
      const path = issue.path.join('.')
      details[path] = details[path] ?? []
      details[path].push(issue.message)
    }
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details,
      },
    })
    return
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.join(', ') ?? 'field'
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: `A record with this ${field} already exists`,
        },
      })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      })
      return
    }
  }

  // Unknown / unhandled errors
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error')

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        env.NODE_ENV === 'development'
          ? err.message
          : 'An unexpected error occurred',
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  })
}
