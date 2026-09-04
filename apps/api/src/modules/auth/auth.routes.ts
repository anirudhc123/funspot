import { Router } from 'express';

import { AuthController } from './auth.controller';
import { authRateLimit } from '../../config/rateLimit';

const router = Router();

router.post('/register', authRateLimit, AuthController.register);
router.post('/login', authRateLimit, AuthController.login);
router.post('/logout', authRateLimit, AuthController.logout);
router.post('/refresh', authRateLimit, AuthController.refresh);
router.post('/forgot-password', authRateLimit, AuthController.forgotPassword);
router.post('/reset-password', authRateLimit, AuthController.resetPassword);

export default router;
