const test = require('node:test');
const assert = require('node:assert/strict');

const { UsersService } = require('../dist/modules/users/users.service.js');
const { UsersRepository, users, follows, followRequests, blocked, muted } = require('../dist/modules/users/users.repository.js');

function resetState() {
  users.length = 0;
  follows.length = 0;
  followRequests.length = 0;
  blocked.length = 0;
  muted.length = 0;

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

test('me returns the signed-in user profile safely without passwordHash', () => {
  resetState();
  const result = UsersService.getMe('u-1');
  assert.equal(result.username, 'alice');
  assert.equal(result.passwordHash, undefined);
});

test('profile update changes requested public profile fields', () => {
  resetState();
  const result = UsersService.updateMe('u-1', { displayName: 'Alice Updated', bio: 'Building the next experience.', privacy: 'private' });
  assert.equal(result.displayName, 'Alice Updated');
  assert.equal(result.privacy, 'private');
});

test('follow request is created for private profile', () => {
  resetState();
  const result = UsersService.followUser('u-1', 'u-2');
  assert.equal(result.status, 'pending');
  assert.equal(followRequests.length, 1);
});

test('follow request can be accepted and then converted into a follow record', () => {
  resetState();
  const request = UsersService.followUser('u-1', 'u-2');
  const accepted = UsersService.acceptFollowRequest(request.followRequest.id);
  assert.equal(accepted.accepted, true);
  assert.equal(follows.length, 1);
});

test('block and mute records are stored for the acting user', () => {
  resetState();
  const blockedResult = UsersService.blockUser('u-1', 'u-2');
  const mutedResult = UsersService.muteUser('u-1', 'u-2');
  assert.equal(blockedResult.blocked, true);
  assert.equal(mutedResult.muted, true);
  assert.equal(blocked.length, 1);
  assert.equal(muted.length, 1);
});

test('followers and following lists return serialized user records', () => {
  resetState();
  UsersRepository.createFollow('u-1', 'u-2', 'accepted');
  UsersRepository.createFollow('u-3', 'u-1', 'accepted');
  const followers = UsersService.followers('alice');
  const following = UsersService.following('alice');
  assert.equal(followers.length, 1);
  assert.equal(following.length, 1);
});
