import { Router } from 'express'
import * as progressController from '../controllers/progress/progress.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/goals', progressController.listGoals)
router.post('/goals', progressController.createGoal)
router.patch('/goals/:id', progressController.updateGoal)
router.delete('/goals/:id', progressController.deleteGoal)

export default router
