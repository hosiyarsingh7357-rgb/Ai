import { Router } from 'express';
import { 
  listConnections, 
  addConnection, 
  deleteConnection, 
  syncConnection 
} from '../controllers/broker.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePlan } from '../middleware/requirePlan.middleware.js';

const router = Router();

router.use(authenticate as any);
router.use(requirePlan('elite') as any); // All broker features are Elite restricted

router.get('/', listConnections);
router.post('/', addConnection);
router.delete('/:id', deleteConnection);
router.post('/:id/sync', syncConnection);

export default router;
