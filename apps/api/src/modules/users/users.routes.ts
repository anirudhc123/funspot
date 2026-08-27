import { Router } from 'express';

import { UsersController } from './users.controller';

const router = Router();

router.get('/me', UsersController.getMe);
router.patch('/me', UsersController.updateMe);
router.get('/follow-requests/:requestId/accept', UsersController.acceptFollowRequest);
router.post('/follow-requests/:requestId/accept', UsersController.acceptFollowRequest);
router.get('/follow-requests/:requestId/reject', UsersController.rejectFollowRequest);
router.post('/follow-requests/:requestId/reject', UsersController.rejectFollowRequest);
router.get('/follow-requests/:requestId/cancel', UsersController.cancelFollowRequest);
router.delete('/follow-requests/:requestId', UsersController.cancelFollowRequest);
router.get('/:username/followers', UsersController.followers);
router.get('/:username/following', UsersController.following);
router.post('/:id/block', UsersController.block);
router.delete('/:id/block', UsersController.unblock);
router.post('/:id/mute', UsersController.mute);
router.delete('/:id/mute', UsersController.unmute);
router.post('/:id/follow', UsersController.follow);
router.delete('/:id/follow', UsersController.unfollow);
router.get('/:username', UsersController.getProfile);

export default router;
