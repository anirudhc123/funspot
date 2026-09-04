import { NextFunction, Request, Response } from 'express';

import { validate } from '../../validators/zod';
import { successResponse } from '../../utils/apiResponse';
import { NotificationsService } from './notifications.service';
import { notificationIdSchema } from './notifications.validator';
import { getRequestUserId } from '../../utils/requestUser';

export class NotificationsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const data = NotificationsService.listForUser(userId);
      res.status(200).json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const { id } = validate(notificationIdSchema, req.params, 'notification id');
      const notification = NotificationsService.markNotificationRead(userId, id);
      res.status(200).json(successResponse(notification));
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const result = NotificationsService.markAllNotificationsRead(userId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
