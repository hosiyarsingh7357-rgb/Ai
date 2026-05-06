import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  const { method, url } = req

  res.on('finish', () => {
    const ms = Date.now() - start
    const { statusCode } = res
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    logger[level]({ method, url, statusCode, ms }, `${method} ${url} ${statusCode} ${ms}ms`)
  })

  next()
}
