import { Router } from 'express';
import { 
  createSession, 
  getSessions, 
  getSessionDetails, 
  addTrade, 
  deleteSession 
} from '../controllers/backtest.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePlan } from '../middleware/requirePlan.middleware';

const router = Router();

router.use(authenticate as any);
router.use(requirePlan('elite') as any);

router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionDetails);
router.post('/sessions/:id/trades', addTrade);
router.delete('/sessions/:id', deleteSession);

export default router;
