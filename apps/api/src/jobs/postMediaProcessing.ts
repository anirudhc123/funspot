import { Queue } from 'bullmq';

import type { PostMediaRecord } from '../modules/posts/posts.repository';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const enqueuePostMediaJobs = async (postId: string, media: PostMediaRecord[]) => {
  if (process.env.NODE_ENV === 'test' || (!process.env.REDIS_HOST && !process.env.REDIS_URL)) {
    return false;
  }

  try {
    const mediaQueue = new Queue('post-media-processing', { connection });

    await Promise.all(
      media.map((item) =>
        mediaQueue.add(item.kind === 'image' ? 'image-processing' : 'video-processing', {
          postId,
          mediaId: item.id,
          objectKey: item.storageKey,
          kind: item.kind,
          status: 'processing',
        }),
      ),
    );

    for (const item of media) {
      await mediaQueue.add('thumbnail-generation', {
        postId,
        mediaId: item.id,
        kind: item.kind,
      });
    }
    return true;
  } catch (_error) {
    return false;
  }
};
