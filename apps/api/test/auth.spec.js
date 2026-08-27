const test = require('node:test');
const assert = require('node:assert/strict');

const { AuthService } = require('../dist/modules/auth/auth.service.js');
const { AuthRepository, sessions } = require('../dist/modules/auth/auth.repository.js');
const { users } = require('../dist/modules/users/users.repository.js');
const { requireAuth } = require('../dist/middleware/requireAuth.js');

const email = 'phase4@example.com';
const username = 'phase4user';

test('registration creates a user and token pair', async () => {
  const result = await AuthService.register({ email, username, displayName: 'Phase4 User', password: 'Password1' });
  assert.equal(Boolean(result.accessToken), true);
  assert.equal(Boolean(result.refreshToken), true);
  assert.equal(result.user.email, email);
  assert.equal(result.user.username, username);
});

test('duplicate email is rejected during registration', async () => {
  await assert.rejects(
    () => AuthService.register({ email, username: 'another', displayName: 'Another', password: 'Password1' }),
    (error) => error.code === 'EMAIL_ALREADY_EXISTS',
  );
});

test('duplicate username is rejected during registration', async () => {
  await assert.rejects(
    () => AuthService.register({ email: 'other@example.com', username, displayName: 'Another', password: 'Password1' }),
    (error) => error.code === 'USERNAME_ALREADY_EXISTS',
  );
});

test('invalid password is rejected', async () => {
  await assert.rejects(
    () => AuthService.register({ email: 'invalid@example.com', username: 'invalidpw', displayName: 'Invalid', password: 'short' }),
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
  const next = AuthService.refresh(first.refreshToken);
  assert.equal(Boolean(next.accessToken), true);
  assert.equal(Boolean(next.refreshToken), true);
  assert.notEqual(next.refreshToken, first.refreshToken);
});

test('logout revokes the stored refresh session token', async () => {
  const first = await AuthService.login({ email, password: 'Password1' });
  const result = AuthService.logout(first.refreshToken);
  assert.equal(result.loggedOut, true);
  assert.equal(sessions.some((s) => s.refreshToken === first.refreshToken && s.revokedAt), true);
});

test('protected middleware authenticates a valid bearer token', async () => {
  const result = await AuthService.login({ email, password: 'Password1' });
  const req = { headers: { authorization: `Bearer ${result.accessToken}` }, cookies: {}, user: undefined };
  const res = { locals: {} };
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.user.username, username);
});
