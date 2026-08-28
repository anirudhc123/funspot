import { Router } from 'express';

import healthRoutes from '../../modules/health/health.routes';
import usersRoutes from '../../modules/users/users.routes';
import authRoutes from '../../modules/auth/auth.routes';
import postsRoutes from '../../modules/posts/posts.routes';
import mediaRoutes from '../../modules/media/media.routes';
import socialRoutes from '../../modules/social/social.routes';

const v1Router = Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/users', usersRoutes);
v1Router.use('/posts', postsRoutes);
v1Router.use('/media', mediaRoutes);
v1Router.use('/posts', socialRoutes);

export default v1Router;
