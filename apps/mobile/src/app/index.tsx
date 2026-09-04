import { Redirect } from 'expo-router';

import { useAuthStore } from '../store/auth-store';

export default function AppIndex() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
