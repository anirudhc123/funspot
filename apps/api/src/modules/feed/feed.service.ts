import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { FeedRepository, FeedScope } from './feed.repository';

export class FeedService {
  static getFeed(userId: string, query: { cursor?: string; limit?: number; scope?: FeedScope; tag?: string }) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
    const scope = query.scope ?? 'following';
    const result = FeedRepository.getFeed({ ...query, userId, scope, limit });

    return {
      items: result.items
        .filter((post) => {
          const author = UsersRepository.findById(post.authorId);
          if (!author) return false;
          if (post.authorId === userId) return true;

          const isFollowing = UsersRepository.getFollowsByFollower(userId).some((follow) => follow.followeeId === post.authorId);

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
        return { users: FeedRepository.searchUsers(normalized), posts: [], hashtags: [] };
      case 'posts':
        return { users: [], posts: FeedRepository.searchPosts(normalized), hashtags: [] };
      case 'hashtags':
        return { users: [], posts: [], hashtags: FeedRepository.searchHashtags(normalized) };
      default:
        return {
          users: FeedRepository.searchUsers(normalized),
          posts: FeedRepository.searchPosts(normalized),
          hashtags: FeedRepository.searchHashtags(normalized),
        };
    }
  }
}
