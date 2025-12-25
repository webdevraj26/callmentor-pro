import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createCall,
  getCalls,
  getCall,
  updateCall,
  deleteCall,
  reanalyzeCall,
  getCallStatus,
} from '../controllers/callsController';

const router = Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.post('/', createCall);
router.get('/', getCalls);
router.get('/:id', getCall);
router.put('/:id', updateCall);
router.delete('/:id', deleteCall);

// Analysis routes
router.post('/:id/analyze', reanalyzeCall);
router.get('/:id/status', getCallStatus);

export default router;
