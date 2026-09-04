import { Router } from 'express';

import { HealthController } from '../../controllers/healthController';

const router = Router();

router.get('/', HealthController.getHealth);
router.get('/db', HealthController.getDatabaseHealth);

export default router;
