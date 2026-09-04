import { Router } from 'express';

import { UsersController } from './users.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/me', requireAuth, UsersController.getMe);
router.patch('/me', requireAuth, UsersController.updateMe);

router.post('/follow-requests/:requestId/accept', requireAuth, UsersController.acceptFollowRequest);
router.post('/follow-requests/:requestId/reject', requireAuth, UsersController.rejectFollowRequest);
router.delete('/follow-requests/:requestId', requireAuth, UsersController.cancelFollowRequest);

router.get('/:username/followers', requireAuth, UsersController.followers);
router.get('/:username/following', requireAuth, UsersController.following);
router.post('/:id/block', requireAuth, UsersController.block);
router.delete('/:id/block', requireAuth, UsersController.unblock);
router.post('/:id/mute', requireAuth, UsersController.mute);
router.delete('/:id/mute', requireAuth, UsersController.unmute);
router.post('/:id/follow', requireAuth, UsersController.follow);
router.delete('/:id/follow', requireAuth, UsersController.unfollow);
router.get('/:username', requireAuth, UsersController.getProfile);

export default router;
