const test = require('node:test');
const assert = require('node:assert/strict');

const { UsersService } = require('../dist/modules/users/users.service.js');
const { UsersRepository, follows, followRequests, blocked, muted } = require('../dist/modules/users/users.repository.js');
const { prisma } = require('../dist/database/prisma.js');
const { cleanupUsers, resetUsers } = require('./helpers/dbUsers.js');

async function resetState() {
  follows.length = 0;
  followRequests.length = 0;
  blocked.length = 0;
  muted.length = 0;
  await resetUsers('users', [
    {
      id: 'users-u-1', email: 'alice@users.test', username: 'users_alice', displayName: 'Alice',
      bio: 'Designer and builder.', avatar: 'https://example.com/alice/avatar.png',
      coverImage: 'https://example.com/alice/cover.png', website: 'https://alice.example',
      location: 'San Francisco', privacy: 'public', passwordHash: 'hash',
    },
    {
      id: 'users-u-2', email: 'bob@users.test', username: 'users_bob', displayName: 'Bob',
      bio: 'Photographer.', avatar: 'https://example.com/bob/avatar.png',
      coverImage: 'https://example.com/bob/cover.png', website: 'https://bob.example',
      location: 'New York', privacy: 'private', passwordHash: 'hash',
    },
    {
      id: 'users-u-3', email: 'carol@users.test', username: 'users_carol', displayName: 'Carol',
      bio: 'Creator.', avatar: 'https://example.com/carol/avatar.png',
      coverImage: 'https://example.com/carol/cover.png', website: 'https://carol.example',
      location: 'Austin', privacy: 'followers', passwordHash: 'hash',
    },
  ]);
}

test.beforeEach(resetState);
test.after(async () => {
  await cleanupUsers('users');
  await prisma.$disconnect();
});

test('me returns the signed-in user profile safely without passwordHash', async () => {
  const result = await UsersService.getMe('users-u-1');
  assert.equal(result.username, 'users_alice');
  assert.equal(result.passwordHash, undefined);
});

test('profile update changes requested public profile fields', async () => {
  const result = await UsersService.updateMe('users-u-1', {
    displayName: 'Alice Updated',
    bio: 'Building the next experience.',
    privacy: 'private',
  });
  assert.equal(result.displayName, 'Alice Updated');
  assert.equal(result.privacy, 'private');
});

test('follow request is created for private profile', async () => {
  const result = await UsersService.followUser('users-u-1', 'users-u-2');
  assert.equal(result.status, 'pending');
  assert.equal(followRequests.length, 1);
});

test('follow request can be accepted and then converted into a follow record', async () => {
  const request = await UsersService.followUser('users-u-1', 'users-u-2');
  const accepted = UsersService.acceptFollowRequest(request.followRequest.id);
  assert.equal(accepted.accepted, true);
  assert.equal(follows.length, 1);
});

test('block and mute records are stored for the acting user', async () => {
  const blockedResult = await UsersService.blockUser('users-u-1', 'users-u-2');
  const mutedResult = await UsersService.muteUser('users-u-1', 'users-u-2');
  assert.equal(blockedResult.blocked, true);
  assert.equal(mutedResult.muted, true);
  assert.equal(blocked.length, 1);
  assert.equal(muted.length, 1);
});

test('followers and following lists return serialized user records', async () => {
  UsersRepository.createFollow('users-u-1', 'users-u-2', 'accepted');
  UsersRepository.createFollow('users-u-3', 'users-u-1', 'accepted');
  const followers = await UsersService.followers('users_alice');
  const following = await UsersService.following('users_alice');
  assert.equal(followers.length, 1);
  assert.equal(following.length, 1);
});
