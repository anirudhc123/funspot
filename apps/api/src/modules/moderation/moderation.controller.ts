import type { NextFunction, Request, Response } from 'express';

import { successResponse } from '../../utils/apiResponse';
import { validate } from '../../validators/zod';
import { ModerationService } from './moderation.service';
import { reportSchema, reportUpdateSchema, roleUpdateSchema, userActionSchema } from './moderation.validator';
import { getRequestUserId } from '../../utils/requestUser';

const actorId = (req: Request): string => getRequestUserId(req);

export class ModerationController {
  static async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = ModerationService.createReport(actorId(req), validate(reportSchema, req.body, 'report'));
      res.status(201).json(successResponse(result));
    } catch (error) { next(error); }
  }

  static async dashboard(_req: Request, res: Response, next: NextFunction) {
    try { res.status(200).json(successResponse(ModerationService.dashboard())); } catch (error) { next(error); }
  }

  static async listUsers(_req: Request, res: Response, next: NextFunction) {
    try { res.status(200).json(successResponse(ModerationService.listUsers())); } catch (error) { next(error); }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(roleUpdateSchema, req.body, 'role');
      res.status(200).json(successResponse(ModerationService.updateRole(actorId(req), req.params.id, payload.role)));
    } catch (error) { next(error); }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(userActionSchema, req.body ?? {}, 'user action');
      const status = req.path.endsWith('/ban') ? 'BANNED' : 'SUSPENDED';
      res.status(200).json(successResponse(ModerationService.setUserStatus(actorId(req), req.params.id, status, payload.reason, payload.durationHours)));
    } catch (error) { next(error); }
  }

  static async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status as 'OPEN' | 'REVIEWED' | 'RESOLVED' : undefined;
      res.status(200).json(successResponse(ModerationService.listReports(status)));
    } catch (error) { next(error); }
  }

  static async reviewReport(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(reportUpdateSchema, req.body, 'report update');
      res.status(200).json(successResponse(ModerationService.reviewReport(actorId(req), req.params.id, payload.status)));
    } catch (error) { next(error); }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(userActionSchema, req.body ?? {}, 'content action');
      res.status(200).json(successResponse(ModerationService.deletePost(actorId(req), req.params.id, payload.reason)));
    } catch (error) { next(error); }
  }

  static async auditLogs(_req: Request, res: Response, next: NextFunction) {
    try { res.status(200).json(successResponse(ModerationService.listAuditLogs())); } catch (error) { next(error); }
  }
}
