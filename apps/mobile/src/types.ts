export type User = {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  bio?: string;
  privacy?: 'public' | 'private' | 'followers';
};

export type Post = {
  id: string;
  authorId: string;
  text?: string;
  privacy: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  hashtags: string[];
  mentions: string[];
  createdAt: string;
  updatedAt?: string;
};

export type NotificationItem = {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'follow_request' | 'mention' | 'repost' | 'message';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type Conversation = {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  memberIds: string[];
  unreadCount: number;
  lastMessage?: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  } | null;
};
