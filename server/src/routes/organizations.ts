import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  inviteMember,
  acceptInvitation,
  getInvitationDetails,
  removeMember,
  updateMemberRole,
  cancelInvitation,
  getOrganizationStats,
} from '../controllers/organizationController';

const router = Router();

// Public routes (no auth required)
router.get('/invite/:token', getInvitationDetails);

// All routes below require authentication
router.use(protect);

// Organization CRUD
router.post('/', createOrganization);
router.get('/my', getMyOrganizations);
router.get('/:id', getOrganization);
router.patch('/:id', updateOrganization);

// Invitation management
router.post('/accept-invitation', acceptInvitation);
router.post('/:id/invite', inviteMember);
router.delete('/:id/invitations/:email', cancelInvitation);

// Member management
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/members/:userId', updateMemberRole);

// Statistics
router.get('/:id/stats', getOrganizationStats);

export default router;
