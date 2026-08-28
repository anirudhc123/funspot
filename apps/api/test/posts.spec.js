const test = require('node:test');
const assert = require('node:assert/strict');

const { PostsService } = require('../dist/modules/posts/posts.service.js');
const { MediaService } = require('../dist/modules/media/media.service.js');
const { users } = require('../dist/modules/users/users.repository.js');
const { posts } = require('../dist/modules/posts/posts.repository.js');

function resetState() {
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

test('create post stores text and parsed hashtags and mentions', async () => {
  resetState();
  const result = await PostsService.createPost('u-1', {
    text: 'Sunset in #travel with @bob',
    location: 'Bali',
    privacy: 'PUBLIC',
    media: [
      { kind: 'image', fileName: 'sunset.jpg', mimeType: 'image/jpeg', sizeBytes: 2 * 1024 * 1024 },
    ],
  });
  assert.equal(result.authorId, 'u-1');
  assert.deepEqual(result.hashtags, ['travel']);
  assert.deepEqual(result.mentions, ['bob']);
  assert.equal(result.media.length, 1);
});

test('private post is forbidden to non-author and non-follower viewer', async () => {
  resetState();
  const result = await PostsService.createPost('u-1', {
    text: 'Private moment',
    privacy: 'PRIVATE',
  });
  assert.throws(() => PostsService.getPost(result.id, 'u-2'), (error) => error.statusCode === 403 && error.code === 'POST_PRIVATE');
});

test('followers-only post allows accepted follower view', async () => {
  resetState();
  const post = await PostsService.createPost('u-1', {
    text: 'Followers only update',
    privacy: 'FOLLOWERS',
  });
  const { UsersRepository } = require('../dist/modules/users/users.repository.js');
  UsersRepository.createFollow('u-2', 'u-1', 'accepted');
  const result = PostsService.getPost(post.id, 'u-2');
  assert.equal(result.authorId, 'u-1');
});

test('media upload signing validates file types and generates signed URLs', () => {
  const signed = MediaService.createSignedUploadUrl({ kind: 'image', fileName: 'cover.png', mimeType: 'image/png', sizeBytes: 1024 * 1024 });
  assert.match(signed.uploadUrl, /s3/);
  assert.match(signed.objectKey, /cover\.png/);
  assert.throws(() => MediaService.validateUploadRequest({ kind: 'image', fileName: 'bad.exe', mimeType: 'application/x-msdownload', sizeBytes: 1024 }), /Only JPG, PNG, WEBP, and GIF images are allowed/);
});

test('post can be updated and then deleted by owner', async () => {
  resetState();
  const created = await PostsService.createPost('u-1', { text: 'Original', privacy: 'PUBLIC' });
  const updated = PostsService.updatePost('u-1', created.id, { text: 'Updated', privacy: 'FOLLOWERS' });
  assert.equal(updated.text, 'Updated');
  assert.equal(updated.privacy, 'FOLLOWERS');
  const deleted = PostsService.deletePost('u-1', created.id);
  assert.equal(deleted.deleted, true);
  assert.throws(() => PostsService.getPost(created.id, 'u-1'), (error) => error.statusCode === 404 && error.code === 'POST_NOT_FOUND');
});

