import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { SocialController } from './social.controller';

const router = Router();

router.post('/:id/like', requireAuth, SocialController.like);
router.delete('/:id/like', requireAuth, SocialController.unlike);

router.post('/:id/comments', requireAuth, SocialController.comment);
router.get('/:id/comments', requireAuth, SocialController.listComments);
router.delete('/comments/:commentId', requireAuth, SocialController.deleteComment);

router.post('/:id/save', requireAuth, SocialController.save);
router.delete('/:id/save', requireAuth, SocialController.unsave);

router.post('/:id/share', requireAuth, SocialController.share);

export default router;
