import { io, type Socket } from 'socket.io-client';

import { secureStorage } from './secure-store';

const resolveSocketUrl = (): string => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export const createChatSocket = async (): Promise<Socket> => {
  const token = await secureStorage.getToken();
  return io(resolveSocketUrl(), { auth: { token }, transports: ['websocket'] });
};
