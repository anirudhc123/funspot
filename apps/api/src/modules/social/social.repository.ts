export type SocialLikeRecord = {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
};

export type SocialSaveRecord = {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
};

export type CommentRecord = {
  id: string;
  postId: string;
  userId: string;
  parentId?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type ShareRecord = {
  id: string;
  userId: string;
  postId: string;
  text?: string;
  createdAt: Date;
};

export const likes: SocialLikeRecord[] = [];
export const saves: SocialSaveRecord[] = [];
export const comments: CommentRecord[] = [];
export const shares: ShareRecord[] = [];

export class SocialRepository {
  static createLike(userId: string, postId: string): SocialLikeRecord {
    const record = { id: `like-${Date.now()}`, userId, postId, createdAt: new Date() };
    likes.push(record);
    return record;
  }

  static removeLike(userId: string, postId: string): void {
    const index = likes.findIndex((like) => like.userId === userId && like.postId === postId);
    if (index >= 0) likes.splice(index, 1);
  }

  static hasLike(userId: string, postId: string): boolean {
    return likes.some((like) => like.userId === userId && like.postId === postId);
  }

  static createSave(userId: string, postId: string): SocialSaveRecord {
    const record = { id: `save-${Date.now()}`, userId, postId, createdAt: new Date() };
    saves.push(record);
    return record;
  }

  static removeSave(userId: string, postId: string): void {
    const index = saves.findIndex((save) => save.userId === userId && save.postId === postId);
    if (index >= 0) saves.splice(index, 1);
  }

  static hasSave(userId: string, postId: string): boolean {
    return saves.some((save) => save.userId === userId && save.postId === postId);
  }

  static addComment(input: Omit<CommentRecord, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }): CommentRecord {
    const record: CommentRecord = {
      id: input.id,
      postId: input.postId,
      userId: input.userId,
      parentId: input.parentId,
      text: input.text,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
    };
    comments.push(record);
    return record;
  }

  static findComments(postId: string, cursor?: string, limit = 20): { items: CommentRecord[]; nextCursor?: string; hasMore: boolean } {
    const filtered = comments.filter((comment) => comment.postId === postId && !comment.deletedAt).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const startIndex = cursor ? filtered.findIndex((comment) => comment.id === cursor) + 1 : 0;
    const page = filtered.slice(startIndex, startIndex + limit);
    const nextCursor = page.length === limit && startIndex + limit < filtered.length ? page[page.length - 1].id : undefined;
    return { items: page, nextCursor, hasMore: Boolean(nextCursor) };
  }

  static findById(commentId: string): CommentRecord | undefined {
    return comments.find((comment) => comment.id === commentId && !comment.deletedAt);
  }

  static deleteComment(commentId: string): void {
    const comment = comments.find((entry) => entry.id === commentId);
    if (comment) comment.deletedAt = new Date();
  }

  static createShare(userId: string, postId: string, text?: string): ShareRecord {
    const record = { id: `share-${Date.now()}`, userId, postId, text, createdAt: new Date() };
    shares.push(record);
    return record;
  }
}
