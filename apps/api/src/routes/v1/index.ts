import { Router } from 'express';

import healthRoutes from '../../modules/health/health.routes';
import usersRoutes from '../../modules/users/users.routes';
import authRoutes from '../../modules/auth/auth.routes';

const v1Router = Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/users', usersRoutes);

export default v1Router;
