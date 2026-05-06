import { Router } from 'express'
import * as tradesController from '../controllers/trades.controller.js'
import { importTrades, previewImport } from '../controllers/import.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createTradeSchema,
  updateTradeSchema,
  listTradesQuerySchema,
} from '../validations/trade.validation.js'
import multer from 'multer'

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['text/csv', 'application/json', 'text/plain']
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON are allowed.') as any, false)
    }
  }
})
const router = Router()

// All trade routes require authentication
router.use(authenticate)

// GET /v1/trades — List trades (paginated + filtered)
router.get('/', validate(listTradesQuerySchema, 'query'), tradesController.listTrades)

// POST /v1/trades — Create single trade
router.post('/', validate(createTradeSchema), tradesController.createTrade)

// POST /v1/trades/bulk-import — Bulk import trades
router.post('/bulk-import', upload.single('file'), importTrades)

// POST /v1/trades/bulk-import-preview — Preview import data
router.post('/bulk-import-preview', upload.single('file'), previewImport)

// GET /v1/trades/:id — Get trade detail
router.get('/:id', tradesController.getTrade)

// PUT /v1/trades/:id — Update trade
router.put('/:id', validate(updateTradeSchema), tradesController.updateTrade)

// DELETE /v1/trades/:id — Soft delete trade
router.delete('/:id', tradesController.deleteTrade)

export default router
