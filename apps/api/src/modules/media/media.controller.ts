import { NextFunction, Request, Response } from 'express';

import { successResponse } from '../../utils/apiResponse';
import { validate } from '../../validators/zod';
import { MediaService } from './media.service';
import { signedUploadSchema } from './media.validator';

export class MediaController {
  static createUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validate(signedUploadSchema, req.body, 'upload-config');
      const result = MediaService.createSignedUploadUrl(parsed);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
