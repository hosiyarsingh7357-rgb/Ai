import { Router } from 'express';
import { 
  analyzeTrade, 
  getWeeklyReport, 
  listReports, 
  getReportDetail, 
  coachChat,
  coachChatStream,
  getTradeReplay,
  getBehavioralInsights,
  patternScan
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePlan } from '../middleware/requirePlan.middleware.js';

const router = Router();

router.use(authenticate as any);

router.post('/analyze-trade/:tradeId', requirePlan('pro'), analyzeTrade);
router.get('/weekly-report', requirePlan('pro'), getWeeklyReport);
router.get('/reports', requirePlan('pro'), listReports);
router.get('/reports/:id', requirePlan('pro'), getReportDetail);

// Advanced / Behavioral Features
router.get('/behavioral-insights', requirePlan('pro'), getBehavioralInsights);
router.get('/pattern-scan', requirePlan('pro'), patternScan);

// Elite Features
router.post('/coach/chat', requirePlan('elite'), coachChat as any);
router.post('/coach/chat/stream', requirePlan('elite'), coachChatStream as any);
router.get('/trades/:id/replay', requirePlan('elite'), getTradeReplay as any);

export default router;
