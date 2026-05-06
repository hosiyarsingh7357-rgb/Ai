import { Router } from 'express'
import authRouter from './auth.routes.js'
import tradesRouter from './trades.routes.js'
import analyticsRouter from './analytics.routes.js'
import aiRouter from './ai.routes.js'
import playbookRouter from './playbook.routes.js'
import billingRouter from './billing.routes.js'
import backtestRouter from './backtest.routes.js'
import brokerRouter from './broker.routes.js'
import tradingAccountRouter from './trading-accounts.routes.js'
import tagsRouter from './tags.routes.js'
import journalRouter from './journal.routes.js'
import userRouter from './user.routes.js'
import progressRouter from './progress.routes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: 'v1' })
})

router.use('/auth', authRouter)
router.use('/trades', tradesRouter)
router.use('/analytics', analyticsRouter)
router.use('/ai', aiRouter)
router.use('/playbooks', playbookRouter)
router.use('/billing', billingRouter)
router.use('/backtest', backtestRouter)
router.use('/brokers', brokerRouter)
router.use('/trading-accounts', tradingAccountRouter)
router.use('/tags', tagsRouter)
router.use('/journal', journalRouter)
router.use('/user', userRouter)
router.use('/progress', progressRouter)

export default router
