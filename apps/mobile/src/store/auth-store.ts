import { create } from 'zustand';

import { secureStorage } from '../lib/secure-store';
import type { User } from '../types';

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  initialize: () => Promise<void>;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  initialize: async () => {
    const token = await secureStorage.getToken();
    set({
      token,
      isAuthenticated: Boolean(token),
      user: token ? { id: 'u-1', username: 'demo', displayName: 'Demo User', email: 'demo@funspot.com' } : null,
      isHydrated: true,
    });
  },
  setAuth: async (token: string, user: User) => {
    await secureStorage.saveToken(token);
    set({ token, user, isAuthenticated: true, isHydrated: true });
  },
  clearAuth: async () => {
    await secureStorage.removeToken();
    set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
  },
}));
