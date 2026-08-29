const test = require('node:test');
const assert = require('node:assert/strict');

const { NotificationsService } = require('../dist/modules/notifications/notifications.service.js');
const { notifications } = require('../dist/modules/notifications/notifications.repository.js');

function resetState() {
  notifications.length = 0;
}

test('notifications list unread items and mark them individually as read', () => {
  resetState();

  const first = NotificationsService.createNotification({
    userId: 'u-1',
    type: 'like',
    actorId: 'u-2',
    title: 'New like',
    body: 'Bob liked your post.',
    entityType: 'post',
    entityId: 'post-1',
  });

  const second = NotificationsService.createNotification({
    userId: 'u-1',
    type: 'comment',
    actorId: 'u-3',
    title: 'New comment',
    body: 'Carol commented on your post.',
    entityType: 'post',
    entityId: 'post-1',
  });

  const all = NotificationsService.listForUser('u-1');
  assert.equal(all.notifications.length, 2);
  assert.equal(all.unreadCount, 2);
  assert.equal(all.notifications.some((notification) => notification.id === first.id), true);
  assert.equal(all.notifications.some((notification) => notification.id === second.id), true);

  const updated = NotificationsService.markNotificationRead('u-1', first.id);
  assert.equal(updated.read, true);

  const remaining = NotificationsService.listForUser('u-1');
  assert.equal(remaining.unreadCount, 1);
  assert.equal(remaining.notifications.find((notification) => notification.id === first.id)?.read, true);
});

test('notifications can be marked all read and are filtered by recipient', () => {
  resetState();

  NotificationsService.createNotification({
    userId: 'u-1',
    type: 'follow',
    actorId: 'u-2',
    title: 'New follower',
    body: 'Bob is following you.',
    entityType: 'user',
    entityId: 'u-2',
  });

  NotificationsService.createNotification({
    userId: 'u-2',
    type: 'message',
    actorId: 'u-1',
    title: 'New message',
    body: 'Alice sent you a message.',
    entityType: 'message',
    entityId: 'msg-1',
  });

  const allRead = NotificationsService.markAllNotificationsRead('u-1');
  assert.equal(allRead.count, 1);
  assert.equal(allRead.notifications[0].read, true);

  const myList = NotificationsService.listForUser('u-1');
  assert.equal(myList.unreadCount, 0);
  assert.equal(myList.notifications.length, 1);

  assert.throws(
    () => {
      NotificationsService.markNotificationRead('u-1', 'missing');
    },
    (error) => Boolean(error) && error.code === 'NOTIFICATION_NOT_FOUND',
  );
});
