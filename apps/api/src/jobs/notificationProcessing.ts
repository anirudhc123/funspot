import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export type NotificationDeliveryPayload = {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean | null | undefined>;
  pushPlatform: 'expo';
};

export const enqueueNotificationJob = async (payload: NotificationDeliveryPayload): Promise<boolean> => {
  if (process.env.NODE_ENV === 'test' || (!process.env.REDIS_HOST && !process.env.REDIS_URL)) {
    return false;
  }

  try {
    const queue = new Queue('notification-delivery', { connection });
    await queue.add('send-push', {
      ...payload,
      data: {
        ...(payload.data ?? {}),
        notificationId: payload.notificationId,
        userId: payload.userId,
        type: payload.type,
      },
    });
    return true;
  } catch (_error) {
    return false;
  }
};
