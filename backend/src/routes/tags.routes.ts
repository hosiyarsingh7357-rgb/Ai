import { Router } from 'express'
import * as tagsController from '../controllers/tags/tags.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.route('/')
  .get(tagsController.getTags)
  .post(tagsController.createTag)

router.route('/:id')
  .patch(tagsController.updateTag)
  .delete(tagsController.deleteTag)

export default router
