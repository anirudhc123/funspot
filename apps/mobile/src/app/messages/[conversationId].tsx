import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { chatApi } from '../../lib/api-client';
import { useAuthStore } from '../../store/auth-store';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const userId = useAuthStore((state) => state.user?.id);
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['messages', conversationId], queryFn: () => chatApi.getMessages(conversationId), enabled: Boolean(conversationId) });
  const send = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(conversationId, message),
    onSuccess: () => { setContent(''); void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }); },
  });

  if (query.isLoading) return <Screen title="Conversation"><LoadingSkeleton /></Screen>;
  if (query.isError) return <Screen title="Conversation"><StateView title="Unable to load messages" description={query.error.message} /></Screen>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation</Text>
      <FlatList
        data={query.data ?? []}
        keyExtractor={(message) => message.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item: message }) => <View style={[styles.message, message.senderId === userId && styles.mine]}><Text>{message.content}</Text></View>}
      />
      <TextInput value={content} onChangeText={setContent} placeholder="Write a message" style={styles.input} />
      <Button disabled={!content.trim() || send.isPending} onPress={() => send.mutate(content.trim())} title={send.isPending ? 'Sending...' : 'Send'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, backgroundColor: '#f3f4f6' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  messages: { gap: 10, paddingVertical: 8 },
  message: { alignSelf: 'flex-start', maxWidth: '85%', backgroundColor: '#e5e7eb', borderRadius: 14, padding: 12 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#dbeafe' },
  input: { backgroundColor: '#ffffff', borderColor: '#d1d5db', borderWidth: 1, borderRadius: 12, padding: 14 },
});
