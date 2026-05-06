import { Router } from 'express'
import * as tradingAccountController from '../controllers/trading-accounts/trading-accounts.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.route('/')
  .get(tradingAccountController.getTradingAccounts)
  .post(tradingAccountController.createTradingAccount)

router.route('/:id')
  .get(tradingAccountController.getTradingAccount)
  .patch(tradingAccountController.updateTradingAccount)
  .delete(tradingAccountController.deleteTradingAccount)

export default router
