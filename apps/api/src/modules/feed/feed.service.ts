import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { FeedRepository, FeedScope } from './feed.repository';

export class FeedService {
  static async getFeed(userId: string, query: { cursor?: string; limit?: number; scope?: FeedScope; tag?: string }) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
    const scope = query.scope ?? 'following';
    const result = FeedRepository.getFeed({ ...query, userId, scope, limit });
    const followingIds = new Set(
      UsersRepository.getFollowsByFollower(userId)
        .filter((follow) => follow.status === 'accepted')
        .map((follow) => follow.followeeId),
    );

    const visiblePosts = await Promise.all(result.items.map(async (post) => {
      const author = await UsersRepository.findById(post.authorId);
      if (!author) return undefined;
      if (post.authorId === userId) return post;

      const isFollowing = followingIds.has(post.authorId);
      if (post.privacy === 'PRIVATE') return undefined;
      if (post.privacy === 'FOLLOWERS') return isFollowing ? post : undefined;
      if (author.privacy === 'private') return isFollowing ? post : undefined;
      return post;
    }));

    return {
      items: visiblePosts
        .filter((post): post is NonNullable<typeof post> => Boolean(post))
        .map((post) => PostsRepository.serialize(post)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  static async search(query: string, type?: 'users' | 'posts' | 'hashtags') {
    const normalized = query.trim();
    if (!normalized) {
      return { users: [], posts: [], hashtags: [] };
    }

    switch (type) {
      case 'users':
        return { users: (await FeedRepository.searchUsers(normalized)).slice(0, 50), posts: [], hashtags: [] };
      case 'posts':
        return { users: [], posts: FeedRepository.searchPosts(normalized).slice(0, 50), hashtags: [] };
      case 'hashtags':
        return { users: [], posts: [], hashtags: FeedRepository.searchHashtags(normalized).slice(0, 50) };
      default:
        return {
          users: (await FeedRepository.searchUsers(normalized)).slice(0, 50),
          posts: FeedRepository.searchPosts(normalized).slice(0, 50),
          hashtags: FeedRepository.searchHashtags(normalized).slice(0, 50),
        };
    }
  }
}
