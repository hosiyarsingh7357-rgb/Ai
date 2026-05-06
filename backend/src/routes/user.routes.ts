import { Router } from 'express'
import * as userController from '../controllers/user/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/profile', userController.getProfile)
router.patch('/profile', userController.updateProfile)
router.patch('/settings', userController.updateSettings)
router.delete('/account', userController.deleteAccount)

export default router
