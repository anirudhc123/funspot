const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { createHash } = require('node:crypto');

const { AuthService } = require('../dist/modules/auth/auth.service.js');
const { prisma } = require('../dist/database/prisma.js');
const { cleanupUsers, resetUsers } = require('./helpers/dbUsers.js');
const { requireAuth } = require('../dist/middleware/requireAuth.js');

const email = 'base@auth.test';
const username = 'authbase';

test.beforeEach(async () => {
  await resetUsers('auth', [{
    id: 'auth-base',
    email,
    username,
    displayName: 'Auth Base',
    passwordHash: bcrypt.hashSync('Password1', 10),
  }]);
});

test.after(async () => {
  await cleanupUsers('auth');
  await prisma.$disconnect();
});

test('registration creates a user and token pair', async () => {
  const result = await AuthService.register({
    email: 'registration@auth.test',
    username: 'registered',
    displayName: 'Phase4 User',
    password: 'Password1',
  });
  assert.equal(Boolean(result.accessToken), true);
  assert.equal(Boolean(result.refreshToken), true);
  assert.equal(result.user.email, 'registration@auth.test');
  assert.equal(result.user.username, 'registered');
});

test('duplicate email is rejected during registration', async () => {
  await assert.rejects(
    () => AuthService.register({ email, username: 'another', displayName: 'Another', password: 'Password1' }),
    (error) => error.code === 'EMAIL_ALREADY_EXISTS',
  );
});

test('duplicate username is rejected during registration', async () => {
  await assert.rejects(
    () => AuthService.register({ email: 'other@auth.test', username, displayName: 'Another', password: 'Password1' }),
    (error) => error.code === 'USERNAME_ALREADY_EXISTS',
  );
});

test('invalid password is rejected', async () => {
  await assert.rejects(
    () => AuthService.register({ email: 'invalid@auth.test', username: 'invalidpw', displayName: 'Invalid', password: 'short' }),
    (error) => error.code === 'INVALID_PASSWORD',
  );
});

test('login succeeds and returns tokens', async () => {
  const result = await AuthService.login({ email, password: 'Password1' });
  assert.equal(Boolean(result.accessToken), true);
  assert.equal(Boolean(result.refreshToken), true);
});

test('wrong password is rejected', async () => {
  await assert.rejects(
    () => AuthService.login({ email, password: 'WrongPassword1' }),
    (error) => error.code === 'INVALID_CREDENTIALS',
  );
});

test('refresh rotates tokens', async () => {
  const first = await AuthService.login({ email, password: 'Password1' });
  const next = await AuthService.refresh(first.refreshToken);
  assert.equal(Boolean(next.accessToken), true);
  assert.equal(Boolean(next.refreshToken), true);
  assert.notEqual(next.refreshToken, first.refreshToken);
});

test('logout revokes the stored refresh session token', async () => {
  const first = await AuthService.login({ email, password: 'Password1' });
  const result = await AuthService.logout(first.refreshToken);
  const tokenHash = createHash('sha256').update(first.refreshToken).digest('hex');
  const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  assert.equal(result.loggedOut, true);
  assert.equal(storedToken.revoked, true);
});

test('protected middleware authenticates a valid bearer token', async () => {
  const result = await AuthService.login({ email, password: 'Password1' });
  const req = { headers: { authorization: `Bearer ${result.accessToken}` }, cookies: {}, user: undefined };
  const res = { locals: {} };
  let nextCalled = false;
  await requireAuth(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.user.username, username);
});
