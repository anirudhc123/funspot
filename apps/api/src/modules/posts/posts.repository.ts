export type PostPrivacy = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export type PostMediaRecord = {
  id: string;
  postId: string;
  kind: 'image' | 'video';
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  fileName: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  status: 'pending' | 'processing' | 'ready';
  createdAt: Date;
};

export type PostRecord = {
  id: string;
  authorId: string;
  text?: string;
  location?: string;
  privacy: PostPrivacy;
  hashtags: string[];
  mentions: string[];
  media: PostMediaRecord[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export const posts: PostRecord[] = [];

export class PostsRepository {
  static create(input: Omit<PostRecord, 'createdAt' | 'updatedAt' | 'media' | 'hashtags' | 'mentions'> & {
    media?: PostMediaRecord[];
    hashtags?: string[];
    mentions?: string[];
  }): PostRecord {
    const post: PostRecord = {
      id: input.id,
      authorId: input.authorId,
      text: input.text,
      location: input.location,
      privacy: input.privacy,
      hashtags: input.hashtags ?? [],
      mentions: input.mentions ?? [],
      media: input.media ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    posts.push(post);
    return post;
  }

  static findById(postId: string): PostRecord | undefined {
    return posts.find((post) => post.id === postId && !post.deletedAt);
  }

  static update(post: PostRecord, changes: Partial<Omit<PostRecord, 'media' | 'createdAt' | 'updatedAt'>> & { media?: PostMediaRecord[] }): PostRecord {
    Object.assign(post, changes, { updatedAt: new Date() });
    return post;
  }

  static delete(post: PostRecord): void {
    post.deletedAt = new Date();
  }

  static count(): number {
    return posts.filter((post) => !post.deletedAt).length;
  }

  static addMedia(post: PostRecord, media: PostMediaRecord): PostMediaRecord {
    post.media.push(media);
    return media;
  }

  static serialize(post: PostRecord) {
    return {
      id: post.id,
      authorId: post.authorId,
      text: post.text,
      location: post.location,
      privacy: post.privacy,
      hashtags: post.hashtags,
      mentions: post.mentions,
      media: post.media.map((media) => ({
        id: media.id,
        postId: media.postId,
        kind: media.kind,
        url: media.url,
        storageKey: media.storageKey,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        fileName: media.fileName,
        width: media.width,
        height: media.height,
        durationSeconds: media.durationSeconds,
        status: media.status,
        createdAt: media.createdAt,
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
