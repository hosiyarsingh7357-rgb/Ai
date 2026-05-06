import Redis from 'ioredis'
import { env } from './environment.js'

// ioredis client — used for both BullMQ queues and general caching
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null, // Do not retry connection if it fails initially
    })
  : null

if (redis) {
  redis.on('error', (err) => {
    // Suppress repeated connection errors
  })
}

export async function connectRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.connect()
      console.log('✅ Redis connected')
    } catch (err) {
      console.warn('⚠️  Redis connection failed — queue features disabled:', err)
    }
  } else {
    console.warn('⚠️  No REDIS_URL configured — queue features disabled')
  }
}
