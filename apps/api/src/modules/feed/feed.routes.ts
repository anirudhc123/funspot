import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { FeedController } from './feed.controller';

const router = Router();

router.get('/', requireAuth, FeedController.getFeed);
router.get('/search', requireAuth, FeedController.search);

export default router;
