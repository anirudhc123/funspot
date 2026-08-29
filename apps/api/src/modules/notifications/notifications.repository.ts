export type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'follow_request' | 'mention' | 'repost' | 'message';

export type NotificationMetadata = Record<string, string | number | boolean | undefined | null>;

export type NotificationRecord = {
  id: string;
  userId: string;
  type: NotificationType;
  actorId?: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  metadata?: NotificationMetadata;
  readAt?: Date;
  createdAt: Date;
};

export const notifications: NotificationRecord[] = [];

export class NotificationsRepository {
  static create(input: Omit<NotificationRecord, 'createdAt'> & { createdAt?: Date }): NotificationRecord {
    const record: NotificationRecord = {
      id: input.id,
      userId: input.userId,
      type: input.type,
      actorId: input.actorId,
      title: input.title,
      body: input.body,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      readAt: input.readAt,
      createdAt: input.createdAt ?? new Date(),
    };

    notifications.push(record);
    return record;
  }

  static listForUser(userId: string): NotificationRecord[] {
    return notifications
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static findById(notificationId: string): NotificationRecord | undefined {
    return notifications.find((notification) => notification.id === notificationId);
  }

  static markRead(notificationId: string, userId: string): NotificationRecord | undefined {
    const notification = notifications.find((item) => item.id === notificationId && item.userId === userId);
    if (!notification) {
      return undefined;
    }

    notification.readAt = new Date();
    return notification;
  }

  static markAllRead(userId: string): NotificationRecord[] {
    const entries = notifications.filter((notification) => notification.userId === userId && !notification.readAt);
    for (const entry of entries) {
      entry.readAt = new Date();
    }
    return entries;
  }

  static serialize(notification: NotificationRecord) {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      actorId: notification.actorId,
      title: notification.title,
      body: notification.body,
      entityType: notification.entityType,
      entityId: notification.entityId,
      metadata: notification.metadata ?? {},
      read: Boolean(notification.readAt),
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }
}
