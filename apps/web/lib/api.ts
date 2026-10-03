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
export type User = { id: string; username: string; displayName: string; email?: string; bio?: string; avatar?: string };
export type Post = { id: string; authorId: string; text?: string; privacy: string; hashtags: string[]; createdAt: string };
export type FeedPage = { items: Post[]; nextCursor?: string; hasMore?: boolean };
export type Notification = { id: string; type: string; title: string; body: string; read: boolean; createdAt: string };
export type Conversation = { id: string; name?: string; type: 'direct' | 'group'; unreadCount: number; memberIds: string[] };
export type Message = { id: string; conversationId: string; senderId: string; content: string; createdAt: string };
export const api = {
  login: (payload: { email: string; password: string }) => apiRequest<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { email: string; username: string; password: string; displayName: string }) => apiRequest<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest<User>('/users/me'),
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
