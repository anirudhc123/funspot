import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { PostsController } from './posts.controller';

const router = Router();

router.post('/', requireAuth, PostsController.create);
router.get('/:id', requireAuth, PostsController.read);
router.patch('/:id', requireAuth, PostsController.update);
router.delete('/:id', requireAuth, PostsController.delete);

export default router;
