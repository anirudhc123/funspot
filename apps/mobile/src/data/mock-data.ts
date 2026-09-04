export const mockFeed = [
  {
    id: 'p-1',
    authorId: 'u-1',
    text: 'Launching the new Funspot build with a fresh mobile experience.',
    privacy: 'PUBLIC',
    hashtags: ['launch', 'mobile'],
    mentions: ['team'],
    createdAt: '2026-08-29T12:00:00.000Z',
  },
  {
    id: 'p-2',
    authorId: 'u-2',
    text: 'Sunset walk around the city. #weekend',
    privacy: 'PUBLIC',
    hashtags: ['weekend'],
    mentions: [],
    createdAt: '2026-08-29T11:30:00.000Z',
  },
  {
    id: 'p-3',
    authorId: 'u-3',
    text: 'Design sprint in progress — still shipping.',
    privacy: 'FOLLOWERS',
    hashtags: ['design'],
    mentions: [],
    createdAt: '2026-08-29T10:45:00.000Z',
  },
];

export const mockNotifications = [
  { id: 'n-1', type: 'like', title: 'New like', body: 'Maya liked your post.', read: false, createdAt: '2026-08-29T12:00:00.000Z' },
  { id: 'n-2', type: 'comment', title: 'New comment', body: 'Alex replied to your thread.', read: false, createdAt: '2026-08-29T11:00:00.000Z' },
  { id: 'n-3', type: 'follow', title: 'New follower', body: 'Rae started following you.', read: true, createdAt: '2026-08-29T08:30:00.000Z' },
];

export const mockConversations = [
  {
    id: 'c-1',
    name: 'Alicia',
    type: 'direct',
    memberIds: ['u-1', 'u-2'],
    unreadCount: 2,
    lastMessage: { id: 'm-1', senderId: 'u-2', content: 'Can we review the launch notes?', createdAt: '2026-08-29T12:30:00.000Z' },
  },
  {
    id: 'c-2',
    name: 'Product team',
    type: 'group',
    memberIds: ['u-1', 'u-2', 'u-3'],
    unreadCount: 0,
    lastMessage: { id: 'm-2', senderId: 'u-3', content: 'Looks good to ship.', createdAt: '2026-08-29T10:00:00.000Z' },
  },
];

export const mockMessages = {
  'c-1': [
    { id: 'm-1', conversationId: 'c-1', senderId: 'u-2', content: 'Can we review the launch notes?', createdAt: '2026-08-29T12:30:00.000Z', readBy: ['u-1'] },
    { id: 'm-2', conversationId: 'c-1', senderId: 'u-1', content: 'Absolutely — I’ll share the summary.', createdAt: '2026-08-29T12:32:00.000Z', readBy: ['u-2', 'u-1'] },
  ],
  'c-2': [
    { id: 'm-3', conversationId: 'c-2', senderId: 'u-3', content: 'Looks good to ship.', createdAt: '2026-08-29T10:00:00.000Z', readBy: ['u-1', 'u-2'] },
  ],
};

export const mockProfile = {
  id: 'u-1',
  username: 'demo',
  displayName: 'Demo User',
  email: 'demo@funspot.com',
  bio: 'Product builder and curious designer.',
  avatar: 'https://images.unsplash.com/...',
  privacy: 'public',
};
