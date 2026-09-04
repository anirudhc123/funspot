import crypto from 'crypto';

import { AppError } from '../../errors/AppError';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

export type SignedUploadRequest = {
  kind: 'image' | 'video';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export class MediaService {
  static validateUploadRequest(input: SignedUploadRequest) {
    if (input.kind === 'image') {
      if (!ALLOWED_IMAGE_TYPES.has(input.mimeType)) {
        throw new AppError(400, 'INVALID_FILE_TYPE', 'Only JPG, PNG, WEBP, and GIF images are allowed.');
      }
      if (input.sizeBytes > MAX_IMAGE_BYTES) {
        throw new AppError(413, 'FILE_TOO_LARGE', 'Image uploads must be under 10MB.');
      }
    }

    if (input.kind === 'video') {
      if (!ALLOWED_VIDEO_TYPES.has(input.mimeType)) {
        throw new AppError(400, 'INVALID_FILE_TYPE', 'Only MP4, WEBM, and MOV video uploads are supported.');
      }
      if (input.sizeBytes > MAX_VIDEO_BYTES) {
        throw new AppError(413, 'FILE_TOO_LARGE', 'Video uploads must be under 100MB.');
      }
    }

    return true;
  }

  static createSignedUploadUrl(input: SignedUploadRequest) {
    MediaService.validateUploadRequest(input);

    const objectKey = `posts/${input.kind}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${input.fileName.replace(/\s+/g, '-')}`;
    const bucket = process.env.OBJECT_STORAGE_BUCKET ?? 'funspot-media-dev';
    const region = process.env.OBJECT_STORAGE_REGION ?? 'us-east-1';
    const uploadUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(objectKey)}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=test&X-Amz-Date=20240101T000000Z&X-Amz-SignedHeaders=host&X-Amz-Signature=test`;

    return {
      uploadUrl,
      objectKey,
      bucket,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
      metadata: {
        kind: input.kind,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      },
    };
  }
}
