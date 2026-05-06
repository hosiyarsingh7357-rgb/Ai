import { Server as SocketServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { logger } from '../utils/logger.js'

let io: SocketServer | null = null

export const initWebSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*', // In production, restrict this to FRONTEND_URL
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`)

    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`)
      logger.info(`Socket ${socket.id} joined room user:${userId}`)
    })

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket not initialized')
  }
  return io
}

export const notifyUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data)
  }
}
