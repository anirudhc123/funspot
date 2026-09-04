import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../store/auth-store';

export default function SplashScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Funspot</Text>
      <Text style={styles.subtitle}>Social moments, powered by people.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 12,
    color: '#d1d5db',
    fontSize: 16,
  },
});
