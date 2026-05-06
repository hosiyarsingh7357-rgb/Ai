import { Router } from 'express'
import { PlaybookController } from '../controllers/playbook.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requirePlan } from '../middleware/requirePlan.middleware'

const router = Router()
const controller = new PlaybookController()

// Public routes (accessible to all authenticated users)
router.get('/public', controller.getPublicPlaybooks)

// Protected routes
router.use(authenticate as any)
router.use(requirePlan('pro') as any)

router.get('/', controller.getPlaybooks)
router.post('/', controller.createPlaybook)
router.patch('/:id', controller.updatePlaybook)
router.delete('/:id', controller.deletePlaybook)

export default router
