const test = require('node:test');
const assert = require('node:assert/strict');

const { AppError } = require('../dist/errors/AppError.js');
const { requireRole } = require('../dist/middleware/requireRole.js');
const { ModerationService } = require('../dist/modules/moderation/moderation.service.js');
const { prisma } = require('../dist/database/prisma.js');
const { cleanupUsers, resetUsers } = require('./helpers/dbUsers.js');

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

test.after(async () => {
  await cleanupUsers('moderation');
  await prisma.$disconnect();
});

test('moderation service records role changes and audit events', async () => {
  const [actor, target] = await resetUsers('moderation', [
    { id: 'moderation-u-1', email: 'actor@moderation.test', username: 'moderation_actor', displayName: 'Actor', role: 'SUPER_ADMIN' },
    { id: 'moderation-u-2', email: 'target@moderation.test', username: 'moderation_target', displayName: 'Target' },
  ]);
  const result = await ModerationService.updateRole(actor.id, target.id, 'MODERATOR');
  assert.equal(result.role, 'MODERATOR');
  assert.equal(ModerationService.listAuditLogs().some((entry) => entry.action === 'UPDATE_USER_ROLE'), true);
});
