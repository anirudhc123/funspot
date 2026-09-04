const test = require('node:test');
const assert = require('node:assert/strict');

const { FeedService } = require('../dist/modules/feed/feed.service.js');
const { PostsService } = require('../dist/modules/posts/posts.service.js');
const { UsersRepository, users, follows } = require('../dist/modules/users/users.repository.js');
const { posts } = require('../dist/modules/posts/posts.repository.js');

function resetState() {
  posts.length = 0;
  users.length = 0;
  follows.length = 0;

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
  users.push({
    id: 'u-3', email: 'carol@example.com', username: 'carol', displayName: 'Carol',
    bio: 'Creator.', avatar: 'https://example.com/carol/avatar.png',
    coverImage: 'https://example.com/carol/cover.png', website: 'https://carol.example',
    location: 'Austin', privacy: 'followers', passwordHash: 'hash',
    createdAt: new Date('2026-01-03T00:00:00Z'), updatedAt: new Date('2026-01-03T00:00:00Z'),
  });
}

test('following feed returns current user and followed authors sorted by recency', async () => {
  resetState();
  UsersRepository.createFollow('u-1', 'u-3', 'accepted');
  const fromBob = await PostsService.createPost('u-2', { text: 'Bob post', privacy: 'PUBLIC' });
  const fromAlice = await PostsService.createPost('u-1', { text: 'Alice post', privacy: 'PUBLIC' });
  const fromCarol = await PostsService.createPost('u-3', { text: 'Carol post', privacy: 'PUBLIC' });
  const result = FeedService.getFeed('u-1', { scope: 'following', limit: 10 });
  assert.equal(result.items.some((post) => post.id === fromAlice.id), true);
  assert.equal(result.items.some((post) => post.id === fromCarol.id), true);
  assert.equal(result.items.some((post) => post.id === fromBob.id), false);
  assert.equal(result.hasMore, false);
});

test('cursor pagination returns nextCursor and hasMore for more than limit items', async () => {
  resetState();
  for (let i = 0; i < 5; i += 1) {
    await PostsService.createPost('u-3', { text: `Post ${i}`, privacy: 'PUBLIC' });
  }
  const result = FeedService.getFeed('u-1', { scope: 'latest', limit: 2 });
  assert.equal(result.items.length, 2);
  assert.equal(result.hasMore, true);
  assert.ok(result.nextCursor);
});

test('search finds users, posts, and hashtags', async () => {
  resetState();
  await PostsService.createPost('u-1', { text: 'Great beach day #travel', privacy: 'PUBLIC' });
  const usersResult = FeedService.search('ali', 'users');
  const postsResult = FeedService.search('beach', 'posts');
  const hashtagsResult = FeedService.search('trav', 'hashtags');
  assert.equal(usersResult.users.some((user) => user.username === 'alice'), true);
  assert.equal(postsResult.posts.some((post) => post.text && post.text.includes('beach')), true);
  assert.equal(hashtagsResult.hashtags.includes('travel'), true);
});

test('private accounts are filtered from feed visibility', async () => {
  resetState();
  const sensitive = await PostsService.createPost('u-2', { text: 'Private update', privacy: 'PRIVATE' });
  const publicPost = await PostsService.createPost('u-3', { text: 'Public update', privacy: 'PUBLIC' });
  const result = FeedService.getFeed('u-1', { scope: 'latest', limit: 10 });
  assert.equal(result.items.some((post) => post.id === sensitive.id), false);
  assert.equal(result.items.some((post) => post.id === publicPost.id), true);
});
