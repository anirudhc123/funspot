import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { NotificationsController } from './notifications.controller';

const router = Router();

router.get('/', requireAuth, NotificationsController.list);
router.patch('/:id/read', requireAuth, NotificationsController.markRead);
router.patch('/read-all', requireAuth, NotificationsController.markAllRead);

export default router;
