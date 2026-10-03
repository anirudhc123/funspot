export type ApiEnvelope<T> = { success: boolean; data: T; error?: { code: string; message: string }; nextCursor?: string; hasMore?: boolean };
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) throw new ApiError(payload.error?.message ?? 'Request failed', response.status);
  return payload.data;
}
export async function apiRequestEnvelope<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${baseUrl}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) throw new ApiError(payload.error?.message ?? 'Request failed', response.status);
  return payload;
}
export type User = { id: string; username: string; displayName: string; email?: string; bio?: string; avatar?: string; privacy?: 'public' | 'private' | 'followers' };
export type PostPrivacy = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
export type PostMedia = {
  id: string;
  postId: string;
  kind: 'image' | 'video';
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  fileName: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  status: 'pending' | 'processing' | 'ready';
  createdAt: string;
};
export type Post = {
  id: string;
  authorId: string;
  text?: string;
  location?: string;
  privacy: PostPrivacy;
  hashtags: string[];
  mentions: string[];
  media: PostMedia[];
  createdAt: string;
  updatedAt: string;
};
export type CreatePostInput = {
  text?: string;
  location?: string;
  privacy?: PostPrivacy;
  media?: Array<{
    kind: 'image' | 'video';
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    url?: string;
    storageKey?: string;
    width?: number;
    height?: number;
    durationSeconds?: number;
  }>;
};
export type SocialRecord = { id: string; userId: string; postId: string; createdAt: string };
export type Comment = {
  id: string;
  postId: string;
  userId: string;
  parentId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};
export type CommentPage = { items: Comment[]; nextCursor?: string; hasMore: boolean };
export type FollowRecord = { id: string; followerId: string; followeeId: string; status: 'accepted' | 'pending' | 'rejected'; createdAt: string };
export type FollowRequest = { id: string; requesterId: string; targetId: string; message?: string; createdAt: string; status: 'accepted' | 'pending' | 'rejected' };
export type FollowResult =
  | { status: 'accepted'; follow: FollowRecord }
  | { status: 'pending'; followRequest: FollowRequest };
export type FeedPage = { items: Post[]; nextCursor?: string; hasMore?: boolean };
export type Notification = { id: string; type: string; title: string; body: string; read: boolean; createdAt: string };
export type Conversation = { id: string; name?: string; type: 'direct' | 'group'; unreadCount: number; memberIds: string[] };
export type Message = { id: string; conversationId: string; senderId: string; content: string; createdAt: string };
export const api = {
  login: (payload: { email: string; password: string }) => apiRequest<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { email: string; username: string; password: string; displayName: string }) => apiRequest<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest<User>('/users/me'),
  createPost: (payload: CreatePostInput) => apiRequest<Post>('/posts', { method: 'POST', body: JSON.stringify(payload) }),
  deletePost: (postId: string) => apiRequest<{ deleted: boolean }>(`/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' }),
  like: (postId: string) => apiRequest<{ liked: true; like: SocialRecord }>(`/posts/${encodeURIComponent(postId)}/like`, { method: 'POST' }),
  unlike: (postId: string) => apiRequest<{ unliked: true }>(`/posts/${encodeURIComponent(postId)}/like`, { method: 'DELETE' }),
  comment: (postId: string, payload: { text: string; parentId?: string }) =>
    apiRequest<Comment>(`/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: JSON.stringify(payload) }),
  comments: (postId: string, cursor?: string) =>
    apiRequest<CommentPage>(`/posts/${encodeURIComponent(postId)}/comments${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
  deleteComment: (commentId: string) =>
    apiRequest<{ deleted: boolean }>(`/posts/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' }),
  save: (postId: string) =>
    apiRequest<{ saved: true; save: SocialRecord }>(`/posts/${encodeURIComponent(postId)}/save`, { method: 'POST' }),
  unsave: (postId: string) =>
    apiRequest<{ unsaved: true }>(`/posts/${encodeURIComponent(postId)}/save`, { method: 'DELETE' }),
  share: (postId: string, payload: { text?: string } = {}) =>
    apiRequest<{ shared: true; share: SocialRecord & { text?: string } }>(`/posts/${encodeURIComponent(postId)}/share`, { method: 'POST', body: JSON.stringify(payload) }),
  follow: (userId: string) => apiRequest<FollowResult>(`/users/${encodeURIComponent(userId)}/follow`, { method: 'POST' }),
  unfollow: (userId: string) => apiRequest<{ destroyed: boolean }>(`/users/${encodeURIComponent(userId)}/follow`, { method: 'DELETE' }),
  feed: async (cursor?: string) => {
    const result = await apiRequestEnvelope<Post[]>(`/feed?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    return { items: result.data, nextCursor: result.nextCursor, hasMore: result.hasMore };
  },
  post: (id: string) => apiRequest<Post>(`/posts/${id}`),
  profile: (username: string) => apiRequest<User>(`/users/${encodeURIComponent(username)}`),
  notifications: () => apiRequest<Notification[]>('/notifications'),
  conversations: () => apiRequest<Conversation[]>('/conversations'),
  messages: (id: string) => apiRequest<Message[]>(`/conversations/${id}/messages`),
};
