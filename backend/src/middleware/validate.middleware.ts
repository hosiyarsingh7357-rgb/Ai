import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'

type ValidationTarget = 'body' | 'query' | 'params'

export const validate =
  (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target])
      req[target] = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const details: Record<string, string[]> = {}
        for (const issue of err.issues) {
          const path = issue.path.join('.') || '_root'
          details[path] = details[path] ?? []
          details[path].push(issue.message)
        }
        next(ApiError.badRequest('Validation error', details))
      } else {
        next(err)
      }
    }
  }
