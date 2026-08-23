import { Request, Response } from 'express';

import { successResponse } from '../utils/apiResponse';
import { HealthService } from '../services/healthService';

export class HealthController {
  static async getHealth(_req: Request, res: Response) {
    const health = await HealthService.getHealthStatus();
    res.status(200).json(successResponse(health));
  }
}
