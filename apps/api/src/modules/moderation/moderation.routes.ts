import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/requireRole';
import { ModerationController } from './moderation.controller';

const router = Router();

router.post('/reports', requireAuth, ModerationController.createReport);
router.get('/dashboard', requireAuth, requireRole('ADMIN'), ModerationController.dashboard);
router.get('/users', requireAuth, requireRole('ADMIN'), ModerationController.listUsers);
router.patch('/users/:id/role', requireAuth, requireRole('SUPER_ADMIN'), ModerationController.updateRole);
router.post('/users/:id/suspend', requireAuth, requireRole('ADMIN'), ModerationController.setStatus);
router.post('/users/:id/ban', requireAuth, requireRole('ADMIN'), ModerationController.setStatus);
router.get('/reports', requireAuth, requireRole('MODERATOR'), ModerationController.listReports);
router.patch('/reports/:id', requireAuth, requireRole('MODERATOR'), ModerationController.reviewReport);
router.delete('/posts/:id', requireAuth, requireRole('MODERATOR'), ModerationController.deletePost);
router.get('/audit-logs', requireAuth, requireRole('ADMIN'), ModerationController.auditLogs);

export default router;
