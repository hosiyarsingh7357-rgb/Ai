import { Router } from 'express';
import { getOverview, getEquityCurve, getPerformanceStats, getRiskMetrics, getPropFirmStats } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/equity-curve', getEquityCurve);
router.get('/performance-stats', getPerformanceStats);
router.get('/risk-metrics', getRiskMetrics);
router.get('/prop-firm', getPropFirmStats);

export default router;
