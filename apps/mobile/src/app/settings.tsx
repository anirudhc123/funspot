import { router } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

import { authApi } from '../lib/api-client';
import { useAuthStore } from '../store/auth-store';

export default function SettingsScreen() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const signOut = async () => {
    await authApi.logout();
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return <View style={styles.container}><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Manage your account and session.</Text><Button onPress={signOut} title="Log out" /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: '#f9fafb' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#6b7280', marginBottom: 10 },
});
