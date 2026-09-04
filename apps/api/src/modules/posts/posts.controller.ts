import { NextFunction, Request, Response } from 'express';

import { successResponse } from '../../utils/apiResponse';
import { validate } from '../../validators/zod';
import { createPostSchema, updatePostSchema } from './posts.validator';
import { PostsService } from './posts.service';
import { getRequestUserId } from '../../utils/requestUser';

export class PostsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = getRequestUserId(req);
      const payload = validate(createPostSchema, req.body, 'post');
      const post = await PostsService.createPost(authorId, payload);
      res.status(201).json(successResponse(post));
    } catch (error) {
      next(error);
    }
  }

  static async read(req: Request, res: Response, next: NextFunction) {
    try {
      const viewerId = req.user?.id;
      const post = PostsService.getPost(req.params.id, viewerId);
      res.status(200).json(successResponse(post));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = getRequestUserId(req);
      const payload = validate(updatePostSchema, req.body, 'post');
      const post = PostsService.updatePost(authorId, req.params.id, payload);
      res.status(200).json(successResponse(post));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = getRequestUserId(req);
      const result = PostsService.deletePost(authorId, req.params.id);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
