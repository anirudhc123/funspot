import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { profileApi } from '../../lib/api-client';

const profileSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().max(160),
  website: z.string().url().or(z.literal('')),
  location: z.string().max(100),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', bio: '', website: '', location: '' },
  });
  const profile = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.getMe });
  useEffect(() => {
    if (profile.data) {
      reset({ displayName: profile.data.displayName, bio: profile.data.bio ?? '', website: '', location: '' });
    }
  }, [profile.data, reset]);
  const submit = async (values: ProfileForm) => {
    try {
      await profileApi.updateMe(values);
      router.back();
    } catch (error) {
      Alert.alert('Unable to save', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit profile</Text>
      {(['displayName', 'bio', 'website', 'location'] as const).map((name) => (
        <View key={name}>
          <Controller control={control} name={name} render={({ field: { onBlur, onChange, value } }) => (
            <TextInput onBlur={onBlur} onChangeText={onChange} placeholder={name} style={[styles.input, name === 'bio' && styles.bio]} value={value} multiline={name === 'bio'} />
          )} />
          {errors[name] ? <Text style={styles.error}>{errors[name]?.message}</Text> : null}
        </View>
      ))}
      <Button disabled={isSubmitting} onPress={() => void handleSubmit(submit)()} title={isSubmitting ? 'Saving...' : 'Save changes'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: '#f9fafb' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 10 },
  input: { backgroundColor: '#ffffff', borderColor: '#d1d5db', borderRadius: 12, borderWidth: 1, padding: 14 },
  bio: { minHeight: 110, textAlignVertical: 'top' },
  error: { color: '#dc2626', marginTop: 4 },
});
