import { AppError } from '../../errors/AppError';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { SocialRepository } from './social.repository';

export class SocialService {
  static likePost(userId: string, postId: string) {
    const user = UsersRepository.findById(userId);
    const post = PostsRepository.findById(postId);
    if (!user || !post) throw new AppError(404, 'POST_OR_USER_NOT_FOUND', 'Post or user was not found.');
    if (SocialRepository.hasLike(userId, postId)) {
      throw new AppError(409, 'LIKE_ALREADY_EXISTS', 'You already liked this post.');
    }

    const like = SocialRepository.createLike(userId, postId);
    return { liked: true, like };
  }

  static unlikePost(userId: string, postId: string) {
    const user = UsersRepository.findById(userId);
    const post = PostsRepository.findById(postId);
    if (!user || !post) throw new AppError(404, 'POST_OR_USER_NOT_FOUND', 'Post or user was not found.');
    if (!SocialRepository.hasLike(userId, postId)) {
      throw new AppError(404, 'LIKE_NOT_FOUND', 'Like was not found.');
    }

    SocialRepository.removeLike(userId, postId);
    return { unliked: true };
  }

  static savePost(userId: string, postId: string) {
    const user = UsersRepository.findById(userId);
    const post = PostsRepository.findById(postId);
    if (!user || !post) throw new AppError(404, 'POST_OR_USER_NOT_FOUND', 'Post or user was not found.');
    if (SocialRepository.hasSave(userId, postId)) {
      throw new AppError(409, 'SAVE_ALREADY_EXISTS', 'You already saved this post.');
    }

    const save = SocialRepository.createSave(userId, postId);
    return { saved: true, save };
  }

  static unsavePost(userId: string, postId: string) {
    const user = UsersRepository.findById(userId);
    const post = PostsRepository.findById(postId);
    if (!user || !post) throw new AppError(404, 'POST_OR_USER_NOT_FOUND', 'Post or user was not found.');
    if (!SocialRepository.hasSave(userId, postId)) {
      throw new AppError(404, 'SAVE_NOT_FOUND', 'Save was not found.');
    }

    SocialRepository.removeSave(userId, postId);
    return { unsaved: true };
  }

  static createComment(userId: string, postId: string, input: { text: string; parentId?: string }) {
    const user = UsersRepository.findById(userId);
    const post = PostsRepository.findById(postId);
    if (!user || !post) throw new AppError(404, 'POST_OR_USER_NOT_FOUND', 'Post or user was not found.');
    if (!input.text.trim()) throw new AppError(400, 'COMMENT_EMPTY', 'Comment text cannot be empty.');
    if (input.parentId) {
      const parent = SocialRepository.findById(input.parentId);
      if (!parent || parent.postId !== postId) {
        throw new AppError(404, 'COMMENT_NOT_FOUND', 'Reply target was not found.');
      }
    }

    const comment = SocialRepository.addComment({
      id: `comment-${Date.now()}`,
      postId,
      userId,
      parentId: input.parentId,
      text: input.text.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return comment;
  }

  static listComments(postId: string, query?: { cursor?: string; limit?: number }) {
    const post = PostsRepository.findById(postId);
    if (!post) throw new AppError(404, 'POST_NOT_FOUND', 'Post was not found.');
    const limit = Math.min(Math.max(query?.limit ?? 20, 1), 50);
    return SocialRepository.findComments(postId, query?.cursor, limit);
  }

  static deleteComment(userId: string, commentId: string) {
    const comment = SocialRepository.findById(commentId);
    if (!comment) throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment was not found.');
    if (comment.userId !== userId) throw new AppError(403, 'COMMENT_FORBIDDEN', 'You cannot delete another user\'s comment.');

    SocialRepository.deleteComment(commentId);
    return { deleted: true };
  }

  static sharePost(userId: string, postId: string, input?: { text?: string }) {
    const user = UsersRepository.findById(userId);
    const post = PostsRepository.findById(postId);
    if (!user || !post) throw new AppError(404, 'POST_OR_USER_NOT_FOUND', 'Post or user was not found.');
    const share = SocialRepository.createShare(userId, postId, input?.text?.trim());
    return { shared: true, share };
  }
}
