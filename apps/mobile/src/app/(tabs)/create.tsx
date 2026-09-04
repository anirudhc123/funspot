import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { Screen } from '../../components/Screen';
import { feedApi } from '../../lib/api-client';

const postSchema = z.object({ text: z.string().min(1).max(5000), privacy: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']) });
type PostForm = z.infer<typeof postSchema>;
export default function CreatePostScreen() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PostForm>({
    resolver: zodResolver(postSchema), defaultValues: { text: '', privacy: 'PUBLIC' },
  });
  const privacy = watch('privacy');
  const submit = async (values: PostForm) => {
    try {
      await feedApi.createPost(values);
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Unable to publish', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen title="Create post" subtitle="Share something with your community">
      <Controller control={control} name="text" render={({ field: { onBlur, onChange, value } }) => (
        <TextInput multiline onBlur={onBlur} onChangeText={onChange} placeholder="What’s happening?" style={styles.input} value={value} />
      )} />
      {errors.text ? <Text style={styles.error}>{errors.text.message}</Text> : null}

      <View style={styles.row}>
        {(['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const).map((level) => (
          <Button
            key={level}
            color={privacy === level ? '#2563eb' : '#9ca3af'}
            onPress={() => setValue('privacy', level)}
            title={level}
          />
        ))}
      </View>

      <Button disabled={isSubmitting} onPress={() => void handleSubmit(submit)()} title={isSubmitting ? 'Posting...' : 'Post'} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 140,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
  },
  row: {
    gap: 10,
  },
  error: { color: '#dc2626' },
});
