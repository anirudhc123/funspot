const test = require('node:test');
const assert = require('node:assert/strict');

const { PostsService } = require('../dist/modules/posts/posts.service.js');
const { SocialService } = require('../dist/modules/social/social.service.js');
const { likes, saves, comments, shares } = require('../dist/modules/social/social.repository.js');
const { posts } = require('../dist/modules/posts/posts.repository.js');
const { prisma } = require('../dist/database/prisma.js');
const { cleanupUsers, resetUsers } = require('./helpers/dbUsers.js');

async function resetState() {
  likes.length = 0;
  saves.length = 0;
  comments.length = 0;
  shares.length = 0;
  posts.length = 0;
  await resetUsers('social', [
    { id: 'social-u-1', email: 'alice@social.test', username: 'social_alice', displayName: 'Alice' },
    { id: 'social-u-2', email: 'bob@social.test', username: 'social_bob', displayName: 'Bob', privacy: 'private' },
  ]);
}

test.after(async () => {
  await cleanupUsers('social');
  await prisma.$disconnect();
});

test('like and save are unique per user and post', async () => {
  await resetState();
  const post = await PostsService.createPost('social-u-1', { text: 'Hello social world', privacy: 'PUBLIC' });
  const firstLike = await SocialService.likePost('social-u-1', post.id);
  assert.equal(firstLike.liked, true);
  await assert.rejects(() => SocialService.likePost('social-u-1', post.id), (error) => error.code === 'LIKE_ALREADY_EXISTS');

  const firstSave = await SocialService.savePost('social-u-1', post.id);
  assert.equal(firstSave.saved, true);
  await assert.rejects(() => SocialService.savePost('social-u-1', post.id), (error) => error.code === 'SAVE_ALREADY_EXISTS');
  assert.equal(likes.length, 1);
  assert.equal(saves.length, 1);
});

test('comments support root comments and nested replies with pagination', async () => {
  await resetState();
  const post = await PostsService.createPost('social-u-1', { text: 'Comment thread', privacy: 'PUBLIC' });
  const root = await SocialService.createComment('social-u-2', post.id, { text: 'First comment' });
  const reply = await SocialService.createComment('social-u-1', post.id, { text: 'Replying', parentId: root.id });
  const page = SocialService.listComments(post.id, { limit: 1 });
  assert.equal(page.items.length, 1);
  assert.equal(page.hasMore, true);
  assert.equal(reply.parentId, root.id);
});

test('comment deletion is restricted to the author', async () => {
  await resetState();
  const post = await PostsService.createPost('social-u-1', { text: 'Delete comment', privacy: 'PUBLIC' });
  const comment = await SocialService.createComment('social-u-2', post.id, { text: 'Test comment' });
  assert.throws(() => SocialService.deleteComment('social-u-1', comment.id), (error) => error.code === 'COMMENT_FORBIDDEN');
  const deleted = SocialService.deleteComment('social-u-2', comment.id);
  assert.equal(deleted.deleted, true);
});

test('sharing a post records the share event', async () => {
  await resetState();
  const post = await PostsService.createPost('social-u-1', { text: 'Share me', privacy: 'PUBLIC' });
  const result = await SocialService.sharePost('social-u-2', post.id, { text: 'Shared' });
  assert.equal(result.shared, true);
  assert.equal(shares.length, 1);
});
