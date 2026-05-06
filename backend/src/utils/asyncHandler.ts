import type { Request, Response, NextFunction, RequestHandler } from 'express'

// Wraps async route handlers to catch errors and pass to express error handler
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
