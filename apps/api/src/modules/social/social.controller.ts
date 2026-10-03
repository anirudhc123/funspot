import { NextFunction, Request, Response } from 'express';

import { successResponse } from '../../utils/apiResponse';
import { validate } from '../../validators/zod';
import { commentSchema, shareSchema } from './social.validator';
import { SocialService } from './social.service';
import { getRequestUserId } from '../../utils/requestUser';

export class SocialController {
  static async like(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const result = await SocialService.likePost(userId, req.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async unlike(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const result = await SocialService.unlikePost(userId, req.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async comment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const payload = validate(commentSchema, req.body, 'comment');
      const result = await SocialService.createComment(userId, req.params.id, payload);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async listComments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = SocialService.listComments(req.params.id, {
        cursor: typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
        limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
      });
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const result = SocialService.deleteComment(userId, req.params.commentId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async save(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const result = await SocialService.savePost(userId, req.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async unsave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const result = await SocialService.unsavePost(userId, req.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async share(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getRequestUserId(req);
      const payload = validate(shareSchema, req.body ?? {}, 'share');
      const result = await SocialService.sharePost(userId, req.params.id, payload);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
