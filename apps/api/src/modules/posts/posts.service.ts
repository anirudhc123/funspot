import { AppError } from '../../errors/AppError';
import { enqueuePostMediaJobs } from '../../jobs/postMediaProcessing';
import { UsersRepository } from '../users/users.repository';
import { PostsRepository, PostMediaRecord, PostPrivacy } from './posts.repository';

const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const createUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export class PostsService {
  static parseHashtags(text?: string): string[] {
    const matches = (text ?? '').match(/#[A-Za-z0-9_]+/g) ?? [];
    const tags = new Set<string>();
    for (const tag of matches) {
      tags.add(tag.slice(1).toLowerCase());
    }
    return Array.from(tags);
  }

  static parseMentions(text?: string): string[] {
    const matches = (text ?? '').match(/@[A-Za-z0-9_.]+/g) ?? [];
    const mentions = new Set<string>();
    for (const mention of matches) {
      mentions.add(mention.slice(1).toLowerCase());
    }
    return Array.from(mentions);
  }

  static validateMedia(media: Array<{ kind: 'image' | 'video'; mimeType: string; sizeBytes: number }>) {
    for (const item of media) {
      const allowed = item.kind === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
      if (!allowed.has(item.mimeType)) {
        throw new AppError(400, 'INVALID_MEDIA_TYPE', `Unsupported ${item.kind} media type.`);
      }
      const limit = item.kind === 'image' ? IMAGE_LIMIT : VIDEO_LIMIT;
      if (item.sizeBytes > limit) {
        throw new AppError(413, 'MEDIA_TOO_LARGE', `${item.kind} media exceeds the allowed size.`);
      }
    }
  }

  static async createPost(authorId: string, payload: { text?: string; location?: string; privacy?: PostPrivacy; media?: Array<{ kind: 'image' | 'video'; fileName: string; mimeType: string; sizeBytes: number; url?: string; storageKey?: string; width?: number; height?: number; durationSeconds?: number }> }) {
    const user = UsersRepository.findById(authorId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Author was not found.');
    }

    const text = payload.text?.trim();
    const normalizedMedia = payload.media ?? [];
    if (!text && normalizedMedia.length === 0) {
      throw new AppError(400, 'POST_EMPTY', 'A post needs text or media.');
    }

    PostsService.validateMedia(normalizedMedia);

    const postId = createUniqueId('post');
    const post = PostsRepository.create({
      id: postId,
      authorId,
      text: text || undefined,
      location: payload.location,
      privacy: payload.privacy ?? 'PUBLIC',
      hashtags: PostsService.parseHashtags(text),
      mentions: PostsService.parseMentions(text),
      media: normalizedMedia.map((item, index) => ({
        id: createUniqueId(`media-${index}`),
        postId,
        kind: item.kind,
        url: item.url ?? `https://cdn.example.com/${item.fileName}`,
        storageKey: item.storageKey ?? `posts/${authorId}/${createUniqueId('media')}-${item.fileName}`,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        fileName: item.fileName,
        width: item.width,
        height: item.height,
        durationSeconds: item.durationSeconds,
        status: 'pending',
        createdAt: new Date(),
      } satisfies PostMediaRecord)),
    });

    try {
      await enqueuePostMediaJobs(post.id, post.media);
    } catch {
      // Ignore queue connection failures during local development and tests.
    }

    return PostsRepository.serialize(post);
  }

  static getPost(postId: string, viewerId?: string) {
    const post = PostsRepository.findById(postId);
    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post was not found.');
    }

    if (post.privacy === 'PRIVATE' && viewerId !== post.authorId) {
      throw new AppError(403, 'POST_PRIVATE', 'This post is private.');
    }

    if (post.privacy === 'FOLLOWERS' && viewerId !== post.authorId) {
      const accepted = viewerId
        ? UsersRepository.getFollowsByFollower(viewerId).some((follow) => follow.followeeId === post.authorId)
        : false;
      if (!accepted) {
        throw new AppError(403, 'POST_FOLLOWERS_ONLY', 'This post is visible to followers only.');
      }
    }

    return PostsRepository.serialize(post);
  }

  static updatePost(authorId: string, postId: string, changes: { text?: string; location?: string; privacy?: PostPrivacy; media?: Array<{ kind: 'image' | 'video'; fileName: string; mimeType: string; sizeBytes: number; url?: string; storageKey?: string; width?: number; height?: number; durationSeconds?: number }> }) {
    const post = PostsRepository.findById(postId);
    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post was not found.');
    }
    if (post.authorId !== authorId) {
      throw new AppError(403, 'POST_FORBIDDEN', 'You are not allowed to edit this post.');
    }

    const nextText = changes.text ?? post.text;
    const nextMedia = changes.media ?? post.media;
    PostsService.validateMedia(nextMedia.map((item) => ({ kind: item.kind, mimeType: item.mimeType, sizeBytes: item.sizeBytes })));

    const updated = PostsRepository.update(post, {
      text: nextText,
      location: changes.location ?? post.location,
      privacy: changes.privacy ?? post.privacy,
      hashtags: PostsService.parseHashtags(nextText),
      mentions: PostsService.parseMentions(nextText),
      media: nextMedia.map((item, index) => ({
        id: item.fileName ? createUniqueId(`media-${index}`) : post.media[index]?.id ?? createUniqueId(`media-${index}`),
        postId: post.id,
        kind: item.kind,
        url: item.url ?? post.media[index]?.url ?? `https://cdn.example.com/${item.fileName}`,
        storageKey: item.storageKey ?? post.media[index]?.storageKey ?? `posts/${authorId}/${createUniqueId('media')}-${item.fileName}`,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        fileName: item.fileName,
        width: item.width,
        height: item.height,
        durationSeconds: item.durationSeconds,
        status: 'pending',
        createdAt: post.media[index]?.createdAt ?? new Date(),
      })),
    });

    return PostsRepository.serialize(updated);
  }

  static deletePost(authorId: string, postId: string) {
    const post = PostsRepository.findById(postId);
    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post was not found.');
    }
    if (post.authorId !== authorId) {
      throw new AppError(403, 'POST_FORBIDDEN', 'You are not allowed to delete this post.');
    }

    PostsRepository.delete(post);
    return { deleted: true };
  }
}
