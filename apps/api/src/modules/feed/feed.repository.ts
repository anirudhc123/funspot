import { posts, PostRecord } from '../posts/posts.repository';
import { follows, users } from '../users/users.repository';

export type FeedScope = 'following' | 'latest' | 'explore' | 'hashtag';

export type FeedQuery = {
  cursor?: string;
  limit?: number;
  scope?: FeedScope;
  tag?: string;
  userId?: string;
};

export class FeedRepository {
  static getFeed(query: FeedQuery): { items: PostRecord[]; nextCursor?: string; hasMore: boolean } {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
    const source = [...posts]
      .filter((post) => !post.deletedAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let items: PostRecord[] = source;

    if (query.scope === 'following' && query.userId) {
      const followingIds = new Set(
        follows.filter((follow) => follow.followerId === query.userId && follow.status === 'accepted').map((follow) => follow.followeeId),
      );
      items = source.filter((post) => followingIds.has(post.authorId) || post.authorId === query.userId);
    }

    if (query.scope === 'hashtag' && query.tag) {
      const normalized = query.tag.toLowerCase();
      items = source.filter((post) => post.hashtags.some((tag) => tag.toLowerCase() === normalized));
    }

    if (query.scope === 'explore') {
      items = source.filter((post) => post.privacy !== 'PRIVATE');
    }

    const cursorIndex = query.cursor ? items.findIndex((post) => post.id === query.cursor) : -1;
    const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const page = items.slice(startIndex, startIndex + limit);
    const nextCursor = page.length === limit && startIndex + limit < items.length ? page[page.length - 1].id : undefined;

    return {
      items: page,
      nextCursor,
      hasMore: Boolean(nextCursor),
    };
  }

  static searchUsers(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return users.filter((user) => user.username.toLowerCase().includes(normalized) || user.displayName.toLowerCase().includes(normalized));
  }

  static searchPosts(query: string): PostRecord[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return posts.filter((post) => !post.deletedAt && (post.text?.toLowerCase().includes(normalized) || post.hashtags.some((tag) => tag.toLowerCase().includes(normalized))));
  }

  static searchHashtags(query: string): string[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const set = new Set<string>();
    for (const post of posts) {
      for (const tag of post.hashtags) {
        if (tag.toLowerCase().includes(normalized)) {
          set.add(tag);
        }
      }
    }
    return Array.from(set);
  }
}
