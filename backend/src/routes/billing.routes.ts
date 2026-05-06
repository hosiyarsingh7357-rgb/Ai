import { Router } from 'express';
import { createSubscription, verifyPayment, handleWebhook, getPortalUrl, getStatus } from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public webhook
router.post('/webhook', handleWebhook);

// Protected routes
router.use(authenticate as any);

router.post('/create-subscription', createSubscription);
router.post('/verify-payment', verifyPayment);
router.get('/portal', getPortalUrl);
router.get('/status', getStatus);

export default router;
