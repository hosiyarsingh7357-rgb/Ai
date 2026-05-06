// Custom API error class with HTTP status codes and machine-readable codes

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: Record<string, string[]>

  constructor(statusCode: number, code: string, message: string, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }

  // Convenience factory methods
  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(400, 'BAD_REQUEST', message, details)
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message)
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, 'FORBIDDEN', message)
  }

  static notFound(resource: string) {
    return new ApiError(404, 'NOT_FOUND', `${resource} not found`)
  }

  static conflict(message: string) {
    return new ApiError(409, 'CONFLICT', message)
  }

  static upgradeRequired(tier: string, message?: string) {
    return new ApiError(403, 'UPGRADE_REQUIRED', message ?? `This feature requires the ${tier} plan`)
  }

  static tooManyRequests() {
    return new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests — try again later')
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_ERROR', message)
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    }
  }
}
