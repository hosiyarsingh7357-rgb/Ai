import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { env } from './config/environment.js'
import { requestLogger } from './middleware/requestLogger.middleware.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import apiRouter from './routes/index.js'
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js'

export function createApp() {
  const app = express()

  // ─── Security ────────────────────────────────────────────────────────────────
  app.use(helmet())
  app.use(apiRateLimiter)
  app.use(
    cors({
      origin: [env.FRONTEND_URL],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  // ─── Body Parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())

  // ─── Compression ────────────────────────────────────────────────────────────
  app.use(compression())

  // ─── Request Logging ────────────────────────────────────────────────────────
  app.use(requestLogger)

  // ─── Routes ─────────────────────────────────────────────────────────────────
  app.use('/v1', apiRouter)

  // ─── Health Check ───────────────────────────────────────────────────────────
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'Trade Journal API is running',
      version: '1.0.0'
    })
  })

  // ─── 404 Handler ────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    })
  })

  // ─── Global Error Handler ───────────────────────────────────────────────────
  app.use(errorHandler)

  return app
}
