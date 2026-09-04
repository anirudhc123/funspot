import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { authApi } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

const registerSchema = z.object({
  displayName: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function RegisterScreen() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: 'Demo Creator', username: 'demo', email: 'demo@funspot.com', password: 'password123' },
  });

  const onSubmit = async (values: { displayName: string; username: string; email: string; password: string }) => {
    try {
      const result = await authApi.register({
        displayName: values.displayName,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      await setAuth(result.tokens.accessToken, {
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
        email: result.user.email,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Unable to create account.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join the Funspot community</Text>

      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput onBlur={onBlur} onChangeText={onChange} placeholder="Display name" style={styles.input} value={value} />
        )}
      />
      {errors.displayName && <Text style={styles.error}>{errors.displayName.message}</Text>}

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} placeholder="Username" style={styles.input} value={value} />
        )}
      />
      {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} placeholder="Email" style={styles.input} value={value} />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput autoCapitalize="none" autoCorrect={false} onBlur={onBlur} onChangeText={onChange} placeholder="Password" secureTextEntry style={styles.input} value={value} />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Button disabled={isSubmitting} onPress={() => void handleSubmit(onSubmit)()} title={isSubmitting ? 'Creating account...' : 'Register'} />

      <Link href="/(auth)/login" asChild>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
