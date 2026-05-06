import type { Response } from 'express'

export interface Meta {
  page?: number
  limit?: number
  total?: number
  nextCursor?: string
}

export class ApiResponse {
  static success<T>(res: Response, data: T, meta?: Meta, statusCode = 200) {
    return res.status(statusCode).json({
      data,
      ...(meta && { meta }),
    })
  }

  static created<T>(res: Response, data: T) {
    return res.status(201).json({ data })
  }

  static noContent(res: Response) {
    return res.status(204).send()
  }

  static message(res: Response, message: string, statusCode = 200) {
    return res.status(statusCode).json({ message })
  }
}
