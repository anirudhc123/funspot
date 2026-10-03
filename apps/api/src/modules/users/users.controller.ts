import { Request, Response, NextFunction } from 'express';

import { UsersService } from './users.service';
import { successResponse } from '../../utils/apiResponse';
import { validate } from '../../validators/zod';
import { profileUpdateSchema } from './users.validator';
import { AppError } from '../../errors/AppError';

export class UsersController {
  private static currentUserId(req: Request): string {
    if (!req.user?.id) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    return req.user.id;
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = UsersController.currentUserId(req);
      const data = await UsersService.getMe(userId);
      res.status(200).json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = UsersController.currentUserId(req);
      const parsed = validate(profileUpdateSchema, req.body, 'profile');
      const updated = await UsersService.updateMe(userId, parsed);
      res.status(200).json(successResponse(updated));
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.params.username;
      const viewerId = UsersController.currentUserId(req);
      const data = await UsersService.getProfile(username, viewerId);
      res.status(200).json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  static async follow(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = UsersController.currentUserId(req);
      const targetId = req.params.id;
      const result = await UsersService.followUser(actorId, targetId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async unfollow(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = UsersController.currentUserId(req);
      const targetId = req.params.id;
      const result = await UsersService.unfollowUser(actorId, targetId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async acceptFollowRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.requestId;
      const result = await UsersService.acceptFollowRequest(requestId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async rejectFollowRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.requestId;
      const result = await UsersService.rejectFollowRequest(requestId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async cancelFollowRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.requestId;
      const result = await UsersService.cancelFollowRequest(requestId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async followers(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.params.username;
      const result = await UsersService.followers(username);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async following(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.params.username;
      const result = await UsersService.following(username);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async block(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = UsersController.currentUserId(req);
      const targetId = req.params.id;
      const result = await UsersService.blockUser(actorId, targetId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async unblock(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = UsersController.currentUserId(req);
      const targetId = req.params.id;
      const result = await UsersService.unblockUser(actorId, targetId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async mute(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = UsersController.currentUserId(req);
      const targetId = req.params.id;
      const result = await UsersService.muteUser(actorId, targetId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async unmute(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = UsersController.currentUserId(req);
      const targetId = req.params.id;
      const result = await UsersService.unmuteUser(actorId, targetId);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
