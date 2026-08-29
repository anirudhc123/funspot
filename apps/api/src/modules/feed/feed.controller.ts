import { NextFunction, Request, Response } from 'express';

import { successResponse } from '../../utils/apiResponse';
import { FeedService } from './feed.service';

export class FeedController {
  static async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id ?? 'u-1';
      const scope = (req.query.scope as 'following' | 'latest' | 'explore' | 'hashtag' | undefined) ?? 'following';
      const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
      const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;

      const result = FeedService.getFeed(userId, { scope, tag, cursor, limit });
      res.status(200).json({
        success: true,
        data: result.items,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q : '';
      const type = typeof req.query.type === 'string' ? (req.query.type as 'users' | 'posts' | 'hashtags') : undefined;
      const result = FeedService.search(query, type);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
