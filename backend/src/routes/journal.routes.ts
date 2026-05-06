import { Router } from 'express'
import * as journalController from '../controllers/journal/journal.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.route('/')
  .get(journalController.getJournalNotes)
  .post(journalController.createJournalNote)

router.route('/:id')
  .patch(journalController.updateJournalNote)
  .delete(journalController.deleteJournalNote)

export default router
