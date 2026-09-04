const test = require('node:test');
const assert = require('node:assert/strict');

const { PostsService } = require('../dist/modules/posts/posts.service.js');
const { SocialService } = require('../dist/modules/social/social.service.js');
const { likes, saves, comments, shares } = require('../dist/modules/social/social.repository.js');
const { users } = require('../dist/modules/users/users.repository.js');
const { posts } = require('../dist/modules/posts/posts.repository.js');

function resetState() {
  likes.length = 0;
  saves.length = 0;
  comments.length = 0;
  shares.length = 0;
  posts.length = 0;
  users.length = 0;

  users.push({
    id: 'u-1', email: 'alice@example.com', username: 'alice', displayName: 'Alice',
    bio: 'Designer and builder.', avatar: 'https://example.com/alice/avatar.png',
    coverImage: 'https://example.com/alice/cover.png', website: 'https://alice.example',
    location: 'San Francisco', privacy: 'public', passwordHash: 'hash',
    createdAt: new Date('2026-01-01T00:00:00Z'), updatedAt: new Date('2026-01-01T00:00:00Z'),
  });
  users.push({
    id: 'u-2', email: 'bob@example.com', username: 'bob', displayName: 'Bob',
    bio: 'Photographer.', avatar: 'https://example.com/bob/avatar.png',
    coverImage: 'https://example.com/bob/cover.png', website: 'https://bob.example',
    location: 'New York', privacy: 'private', passwordHash: 'hash',
    createdAt: new Date('2026-01-02T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z'),
  });
}

test('like and save are unique per user and post', async () => {
  resetState();
  const post = await PostsService.createPost('u-1', { text: 'Hello social world', privacy: 'PUBLIC' });
  const firstLike = SocialService.likePost('u-1', post.id);
  assert.equal(firstLike.liked, true);
  assert.throws(() => SocialService.likePost('u-1', post.id), (error) => error.code === 'LIKE_ALREADY_EXISTS');

  const firstSave = SocialService.savePost('u-1', post.id);
  assert.equal(firstSave.saved, true);
  assert.throws(() => SocialService.savePost('u-1', post.id), (error) => error.code === 'SAVE_ALREADY_EXISTS');
  assert.equal(likes.length, 1);
  assert.equal(saves.length, 1);
});

test('comments support root comments and nested replies with pagination', async () => {
  resetState();
  const post = await PostsService.createPost('u-1', { text: 'Comment thread', privacy: 'PUBLIC' });
  const root = SocialService.createComment('u-2', post.id, { text: 'First comment' });
  const reply = SocialService.createComment('u-1', post.id, { text: 'Replying', parentId: root.id });
  const page = SocialService.listComments(post.id, { limit: 1 });
  assert.equal(page.items.length, 1);
  assert.equal(page.hasMore, true);
  assert.equal(reply.parentId, root.id);
});

test('comment deletion is restricted to the author', async () => {
  resetState();
  const post = await PostsService.createPost('u-1', { text: 'Delete comment', privacy: 'PUBLIC' });
  const comment = SocialService.createComment('u-2', post.id, { text: 'Test comment' });
  assert.throws(() => SocialService.deleteComment('u-1', comment.id), (error) => error.code === 'COMMENT_FORBIDDEN');
  const deleted = SocialService.deleteComment('u-2', comment.id);
  assert.equal(deleted.deleted, true);
});

test('sharing a post records the share event', async () => {
  resetState();
  const post = await PostsService.createPost('u-1', { text: 'Share me', privacy: 'PUBLIC' });
  const result = SocialService.sharePost('u-2', post.id, { text: 'Shared' });
  assert.equal(result.shared, true);
  assert.equal(shares.length, 1);
});
