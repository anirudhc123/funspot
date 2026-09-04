import { Platform } from 'react-native';

import { secureStorage } from './secure-store';

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  nextCursor?: string;
  hasMore?: boolean;
};

type RequestOptions = RequestInit & { token?: string | null };

const resolveBaseUrl = (): string =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1');

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = options.token ?? (await secureStorage.getToken());
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${resolveBaseUrl()}${path}`, { ...options, headers });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message ?? 'Request failed');
  }
  return payload.data;
};

const requestEnvelope = async <T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> => {
  const token = options.token ?? (await secureStorage.getToken());
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${resolveBaseUrl()}${path}`, { ...options, headers });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) throw new Error(payload.error?.message ?? 'Request failed');
  return payload;
};

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
};

export const authApi = {
  async login(email: string, password: string) {
    const result = await request<{ user: AuthUser; tokens: { accessToken: string } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    await secureStorage.saveToken(result.tokens.accessToken);
    return result;
  },
  async register(payload: { email: string; username: string; password: string; displayName: string }) {
    const result = await request<{ user: AuthUser; tokens: { accessToken: string } }>('/auth/register', {
      method: 'POST', body: JSON.stringify(payload),
    });
    await secureStorage.saveToken(result.tokens.accessToken);
    return result;
  },
  async logout() {
    await request('/auth/logout', { method: 'POST' });
    await secureStorage.removeToken();
  },
  async refresh() {
    return request<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
  },
};

export type MobilePost = {
  id: string;
  authorId: string;
  text?: string;
  privacy: string;
  createdAt: string;
  hashtags: string[];
};

export const feedApi = {
  async getFeed(cursor?: string) {
    const query = new URLSearchParams({ limit: '10' });
    if (cursor) query.set('cursor', cursor);
    return request<MobilePost[]>(`/feed?${query.toString()}`);
  },
  async getFeedPage(cursor?: string) {
    const query = new URLSearchParams({ limit: '10' });
    if (cursor) query.set('cursor', cursor);
    const result = await requestEnvelope<MobilePost[]>(`/feed?${query.toString()}`);
    return { items: result.data, nextCursor: result.nextCursor, hasMore: result.hasMore ?? false };
  },
  async createPost(payload: { text?: string; privacy?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'; location?: string }) {
    return request<MobilePost>('/posts', { method: 'POST', body: JSON.stringify(payload) });
  },
  async getPost(id: string) {
    return request<MobilePost>(`/posts/${id}`);
  },
};

export const notificationsApi = {
  async list() {
    return request<Array<{ id: string; type: string; title: string; body: string; read: boolean; createdAt: string }>>('/notifications');
  },
  async markRead(id: string) {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },
  async markAllRead() {
    return request('/notifications/read-all', { method: 'PATCH' });
  },
};

export const profileApi = {
  async getMe() {
    return request<{ id: string; username: string; displayName: string; email: string; bio?: string; avatar?: string; privacy: string }>('/users/me');
  },
  async updateMe(payload: { displayName?: string; bio?: string; avatar?: string; coverImage?: string; website?: string; location?: string; privacy?: 'public' | 'private' | 'followers' }) {
    return request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async follow(userId: string) {
    return request(`/users/${userId}/follow`, { method: 'POST' });
  },
  async unfollow(userId: string) {
    return request(`/users/${userId}/follow`, { method: 'DELETE' });
  },
};

export const socialApi = {
  async like(postId: string) { return request(`/posts/${postId}/like`, { method: 'POST' }); },
  async unlike(postId: string) { return request(`/posts/${postId}/like`, { method: 'DELETE' }); },
  async comment(postId: string, content: string, parentId?: string) {
    return request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId }) });
  },
};

export type MobileMessage = { id: string; conversationId: string; senderId: string; content: string; createdAt: string; readBy: string[] };

export const chatApi = {
  async getConversations() {
    return request<Array<{ id: string; name?: string; type: 'direct' | 'group'; unreadCount: number; memberIds: string[]; lastMessage?: { content: string } | null }>>('/conversations');
  },
  async getMessages(conversationId: string) {
    return request<MobileMessage[]>(`/conversations/${conversationId}/messages`);
  },
  async sendMessage(conversationId: string, content: string) {
    return request<MobileMessage>(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
  },
};
