import { Router } from 'express';
import { protect } from '../middleware/auth';
import { audioUpload, handleUploadError } from '../middleware/upload';
import {
  createCall,
  createCallWithAudio,
  getCalls,
  getCall,
  updateCall,
  deleteCall,
  reanalyzeCall,
  getCallStatus,
  streamAudio,
} from '../controllers/callsController';

const router = Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.post('/', createCall);
router.post('/upload', audioUpload.single('audio'), handleUploadError, createCallWithAudio);
router.get('/', getCalls);
router.get('/:id', getCall);
router.put('/:id', updateCall);
router.delete('/:id', deleteCall);

// Analysis routes
router.post('/:id/analyze', reanalyzeCall);
router.get('/:id/status', getCallStatus);

// Audio streaming
router.get('/:id/audio', streamAudio);

export default router;
