import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { FeedRepository, FeedScope } from './feed.repository';

export class FeedService {
  static getFeed(userId: string, query: { cursor?: string; limit?: number; scope?: FeedScope; tag?: string }) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
    const scope = query.scope ?? 'following';
    const result = FeedRepository.getFeed({ ...query, userId, scope, limit });
    const followingIds = new Set(
      UsersRepository.getFollowsByFollower(userId)
        .filter((follow) => follow.status === 'accepted')
        .map((follow) => follow.followeeId),
    );

    return {
      items: result.items
        .filter((post) => {
          const author = UsersRepository.findById(post.authorId);
          if (!author) return false;
          if (post.authorId === userId) return true;

          const isFollowing = followingIds.has(post.authorId);

          if (post.privacy === 'PRIVATE') return false;
          if (post.privacy === 'FOLLOWERS') return isFollowing;
          if (author.privacy === 'private') return isFollowing;
          return true;
        })
        .map((post) => PostsRepository.serialize(post)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  static search(query: string, type?: 'users' | 'posts' | 'hashtags') {
    const normalized = query.trim();
    if (!normalized) {
      return { users: [], posts: [], hashtags: [] };
    }

    switch (type) {
      case 'users':
        return { users: FeedRepository.searchUsers(normalized).slice(0, 50), posts: [], hashtags: [] };
      case 'posts':
        return { users: [], posts: FeedRepository.searchPosts(normalized).slice(0, 50), hashtags: [] };
      case 'hashtags':
        return { users: [], posts: [], hashtags: FeedRepository.searchHashtags(normalized).slice(0, 50) };
      default:
        return {
          users: FeedRepository.searchUsers(normalized).slice(0, 50),
          posts: FeedRepository.searchPosts(normalized).slice(0, 50),
          hashtags: FeedRepository.searchHashtags(normalized).slice(0, 50),
        };
    }
  }
}
