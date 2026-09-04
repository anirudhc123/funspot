import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { MediaController } from './media.controller';

const router = Router();

router.post('/upload-url', requireAuth, MediaController.createUploadUrl);

export default router;
