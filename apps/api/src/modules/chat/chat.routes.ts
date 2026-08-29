import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth';
import { ChatController } from './chat.controller';

const router = Router();

router.get('/', requireAuth, ChatController.listConversations);
router.post('/', requireAuth, ChatController.createConversation);
router.get('/:id/messages', requireAuth, ChatController.getMessages);
router.post('/:id/messages', requireAuth, ChatController.sendMessage);

export default router;
