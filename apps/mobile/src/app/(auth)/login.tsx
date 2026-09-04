import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { authApi } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginScreen() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@funspot.com', password: 'password123' },
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await authApi.login(values.email, values.password);
      await setAuth(result.tokens.accessToken, {
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
        email: result.user.email,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Unable to log in.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Email"
            style={styles.input}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Button disabled={isSubmitting} onPress={() => void handleSubmit(onSubmit)()} title={isSubmitting ? 'Signing in...' : 'Log in'} />

      <Link href="/(auth)/register" asChild>
        <Text style={styles.link}>Need an account? Register</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: '#6b7280',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
  link: {
    marginTop: 18,
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '600',
  },
});
