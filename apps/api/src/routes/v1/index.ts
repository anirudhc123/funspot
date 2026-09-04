import { Router } from 'express';

import healthRoutes from '../../modules/health/health.routes';
import usersRoutes from '../../modules/users/users.routes';
import authRoutes from '../../modules/auth/auth.routes';
import postsRoutes from '../../modules/posts/posts.routes';
import mediaRoutes from '../../modules/media/media.routes';
import socialRoutes from '../../modules/social/social.routes';
import feedRoutes from '../../modules/feed/feed.routes';
import notificationsRoutes from '../../modules/notifications/notifications.routes';
import chatRoutes from '../../modules/chat/chat.routes';
import moderationRoutes from '../../modules/moderation/moderation.routes';

const v1Router = Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/users', usersRoutes);
v1Router.use('/posts', postsRoutes);
v1Router.use('/posts', socialRoutes);
v1Router.use('/media', mediaRoutes);
v1Router.use('/feed', feedRoutes);
v1Router.use('/notifications', notificationsRoutes);
v1Router.use('/conversations', chatRoutes);
v1Router.use('/moderation', moderationRoutes);
v1Router.use('/admin', moderationRoutes);
v1Router.use('/admin', moderationRoutes);

export default v1Router;
