const test = require('node:test');
const assert = require('node:assert/strict');

const { FeedService } = require('../dist/modules/feed/feed.service.js');
const { PostsService } = require('../dist/modules/posts/posts.service.js');
const { UsersRepository, follows } = require('../dist/modules/users/users.repository.js');
const { posts } = require('../dist/modules/posts/posts.repository.js');
const { prisma } = require('../dist/database/prisma.js');
const { cleanupUsers, resetUsers } = require('./helpers/dbUsers.js');

async function resetState() {
  posts.length = 0;
  follows.length = 0;

  await resetUsers('feed', [
    { id: 'feed-u-1', email: 'alice@feed.test', username: 'feed_alice', displayName: 'Alice', privacy: 'public' },
    { id: 'feed-u-2', email: 'bob@feed.test', username: 'feed_bob', displayName: 'Bob', privacy: 'private' },
    { id: 'feed-u-3', email: 'carol@feed.test', username: 'feed_carol', displayName: 'Carol', privacy: 'followers' },
  ]);
}

test.after(async () => {
  await cleanupUsers('feed');
  await prisma.$disconnect();
});

test('following feed returns current user and followed authors sorted by recency', async () => {
  await resetState();
  UsersRepository.createFollow('feed-u-1', 'feed-u-3', 'accepted');
  const fromBob = await PostsService.createPost('feed-u-2', { text: 'Bob post', privacy: 'PUBLIC' });
  const fromAlice = await PostsService.createPost('feed-u-1', { text: 'Alice post', privacy: 'PUBLIC' });
  const fromCarol = await PostsService.createPost('feed-u-3', { text: 'Carol post', privacy: 'PUBLIC' });
  const result = await FeedService.getFeed('feed-u-1', { scope: 'following', limit: 10 });
  assert.equal(result.items.some((post) => post.id === fromAlice.id), true);
  assert.equal(result.items.some((post) => post.id === fromCarol.id), true);
  assert.equal(result.items.some((post) => post.id === fromBob.id), false);
  assert.equal(result.hasMore, false);
});

test('cursor pagination returns nextCursor and hasMore for more than limit items', async () => {
  await resetState();
  for (let i = 0; i < 5; i += 1) {
    await PostsService.createPost('feed-u-3', { text: `Post ${i}`, privacy: 'PUBLIC' });
  }
  const result = await FeedService.getFeed('feed-u-1', { scope: 'latest', limit: 2 });
  assert.equal(result.items.length, 2);
  assert.equal(result.hasMore, true);
  assert.ok(result.nextCursor);
});

test('search finds users, posts, and hashtags', async () => {
  await resetState();
  await PostsService.createPost('feed-u-1', { text: 'Great beach day #travel', privacy: 'PUBLIC' });
  const usersResult = await FeedService.search('ali', 'users');
  const postsResult = await FeedService.search('beach', 'posts');
  const hashtagsResult = await FeedService.search('trav', 'hashtags');
  assert.equal(usersResult.users.some((user) => user.username === 'feed_alice'), true);
  assert.equal(postsResult.posts.some((post) => post.text && post.text.includes('beach')), true);
  assert.equal(hashtagsResult.hashtags.includes('travel'), true);
});

test('private accounts are filtered from feed visibility', async () => {
  await resetState();
  const sensitive = await PostsService.createPost('feed-u-2', { text: 'Private update', privacy: 'PRIVATE' });
  const publicPost = await PostsService.createPost('feed-u-3', { text: 'Public update', privacy: 'PUBLIC' });
  const result = await FeedService.getFeed('feed-u-1', { scope: 'latest', limit: 10 });
  assert.equal(result.items.some((post) => post.id === sensitive.id), false);
  assert.equal(result.items.some((post) => post.id === publicPost.id), true);
});
