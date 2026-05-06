import { createApp } from './app.js'
import { env } from './config/environment.js'
import prisma from './config/database.js'
import { connectRedis } from './config/redis.js'
import { logger } from './utils/logger.js'
import { initWeeklyReportJob } from './jobs/weeklyReport.job'

async function bootstrap() {
  // Validate DB connection
  try {
    await prisma.$connect()
    logger.info('✅ Database connected')
  } catch (err) {
    logger.warn({ err }, '⚠️ Database connection failed, but proceeding anyway')
  }

  // Connect Redis (non-fatal)
  await connectRedis()

  // Initialize Jobs
  initWeeklyReportJob()

  const app = createApp()

  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        url: env.API_URL,
      },
      `🚀 API server running at ${env.API_URL}`
    )
  })

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`)
    server.close(async () => {
      await prisma.$disconnect()
      logger.info('🛑 Server closed')
      process.exit(0)
    })
    // Force close after 10s
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout')
      process.exit(1)
    }, 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
