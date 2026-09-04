import { AppError } from '../../errors/AppError';
import { enqueueNotificationJob } from '../../jobs/notificationProcessing';
import { NotificationMetadata, NotificationType, NotificationsRepository } from './notifications.repository';

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  actorId?: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  metadata?: NotificationMetadata;
};

export class NotificationsService {
  static createNotification(input: CreateNotificationInput) {
    const notification = NotificationsRepository.create({
      id: `notification-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      userId: input.userId,
      type: input.type,
      actorId: input.actorId,
      title: input.title,
      body: input.body,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? {},
      createdAt: new Date(),
    });

    void enqueueNotificationJob({
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: {
        ...(notification.metadata ?? {}),
        entityType: notification.entityType,
        entityId: notification.entityId,
      },
      pushPlatform: 'expo',
    });

    return NotificationsRepository.serialize(notification);
  }

  static listForUser(userId: string) {
    const notifications = NotificationsRepository.listForUser(userId);
    return {
      notifications: notifications.map((notification) => NotificationsRepository.serialize(notification)),
      unreadCount: notifications.filter((notification) => !notification.readAt).length,
    };
  }

  static markNotificationRead(userId: string, notificationId: string) {
    const notification = NotificationsRepository.findById(notificationId);
    if (!notification) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification was not found.');
    }
    if (notification.userId !== userId) {
      throw new AppError(403, 'NOTIFICATION_FORBIDDEN', 'You cannot access this notification.');
    }

    const updated = NotificationsRepository.markRead(notificationId, userId);
    if (!updated) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification was not found.');
    }

    return NotificationsRepository.serialize(updated);
  }

  static markAllNotificationsRead(userId: string) {
    const updated = NotificationsRepository.markAllRead(userId);
    return {
      count: updated.length,
      notifications: updated.map((notification) => NotificationsRepository.serialize(notification)),
    };
  }

  static notifyLike(recipientId: string, actorId: string, entityId?: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'like',
      actorId,
      title: 'New like',
      body: 'Someone liked your post.',
      entityType: 'post',
      entityId,
      metadata: { actorId, entityId: entityId ?? '' },
    });
  }

  static notifyComment(recipientId: string, actorId: string, entityId?: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'comment',
      actorId,
      title: 'New comment',
      body: 'Someone commented on your post.',
      entityType: 'post',
      entityId,
      metadata: { actorId, entityId: entityId ?? '' },
    });
  }

  static notifyReply(recipientId: string, actorId: string, entityId?: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'reply',
      actorId,
      title: 'New reply',
      body: 'Someone replied to your comment.',
      entityType: 'comment',
      entityId,
      metadata: { actorId, entityId: entityId ?? '' },
    });
  }

  static notifyFollow(recipientId: string, actorId: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'follow',
      actorId,
      title: 'New follower',
      body: 'Someone started following you.',
      entityType: 'user',
      entityId: actorId,
      metadata: { actorId },
    });
  }

  static notifyFollowRequest(recipientId: string, actorId: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'follow_request',
      actorId,
      title: 'Follow request',
      body: 'Someone wants to follow you.',
      entityType: 'user',
      entityId: actorId,
      metadata: { actorId },
    });
  }

  static notifyMention(recipientId: string, actorId: string, entityId?: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'mention',
      actorId,
      title: 'You were mentioned',
      body: 'Someone mentioned you in a post.',
      entityType: 'post',
      entityId,
      metadata: { actorId, entityId: entityId ?? '' },
    });
  }

  static notifyRepost(recipientId: string, actorId: string, entityId?: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'repost',
      actorId,
      title: 'Post reposted',
      body: 'Someone reposted your content.',
      entityType: 'post',
      entityId,
      metadata: { actorId, entityId: entityId ?? '' },
    });
  }

  static notifyMessage(recipientId: string, actorId: string, entityId?: string) {
    return this.createNotification({
      userId: recipientId,
      type: 'message',
      actorId,
      title: 'New message',
      body: 'You have a new message.',
      entityType: 'message',
      entityId,
      metadata: { actorId, entityId: entityId ?? '' },
    });
  }
}
