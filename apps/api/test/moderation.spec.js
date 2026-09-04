const test = require('node:test');
const assert = require('node:assert/strict');

const { AppError } = require('../dist/errors/AppError.js');
const { requireRole } = require('../dist/middleware/requireRole.js');
const { ModerationService } = require('../dist/modules/moderation/moderation.service.js');
const { users } = require('../dist/modules/users/users.repository.js');

const requestFor = (role) => ({ user: { id: 'actor', role } });
const runGuard = (role, required) => {
  let error;
  requireRole(required)(requestFor(role), {}, (value) => { error = value; });
  return error;
};

test('user role cannot access moderator actions', () => {
  const error = runGuard('USER', 'MODERATOR');
  assert.equal(error instanceof AppError, true);
  assert.equal(error.code, 'INSUFFICIENT_ROLE');
});

test('moderator can access moderation actions but not admin actions', () => {
  assert.equal(runGuard('MODERATOR', 'MODERATOR'), undefined);
  assert.equal(runGuard('MODERATOR', 'ADMIN').code, 'INSUFFICIENT_ROLE');
});

test('admin can access dashboard actions but not role management', () => {
  assert.equal(runGuard('ADMIN', 'ADMIN'), undefined);
  assert.equal(runGuard('ADMIN', 'SUPER_ADMIN').code, 'INSUFFICIENT_ROLE');
});

test('super admin can access role management', () => {
  assert.equal(runGuard('SUPER_ADMIN', 'SUPER_ADMIN'), undefined);
});

test('moderation service records role changes and audit events', () => {
  const target = users.find((user) => user.id === 'u-2');
  const actor = users.find((user) => user.id === 'u-1');
  assert.ok(target);
  assert.ok(actor);
  actor.role = 'SUPER_ADMIN';
  const result = ModerationService.updateRole(actor.id, target.id, 'MODERATOR');
  assert.equal(result.role, 'MODERATOR');
  assert.equal(ModerationService.listAuditLogs().some((entry) => entry.action === 'UPDATE_USER_ROLE'), true);
});
