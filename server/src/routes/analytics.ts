import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getDashboardMetrics,
  getScoreTrends,
  getObjectionStats,
  getPerformanceDimensions,
  getRecentCalls,
  getCoachingInsights,
  getPublicStats,
} from '../controllers/analyticsController';

const router = Router();

// Public routes (no auth required)
router.get('/public-stats', getPublicStats);

// Protected routes require authentication
router.use(protect);

// Dashboard and overview
router.get('/dashboard', getDashboardMetrics);
router.get('/trends', getScoreTrends);
router.get('/dimensions', getPerformanceDimensions);

// Detailed analytics
router.get('/objections', getObjectionStats);
router.get('/insights', getCoachingInsights);

// Quick data
router.get('/recent-calls', getRecentCalls);

export default router;
