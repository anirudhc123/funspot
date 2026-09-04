import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { StateView } from '../../components/StateView';
import { chatApi } from '../../lib/api-client';

export default function MessagesScreen() {
  const query = useQuery({ queryKey: ['conversations'], queryFn: chatApi.getConversations });
  if (query.isLoading) return <Screen title="Messages"><LoadingSkeleton /></Screen>;
  if (query.isError) return <Screen title="Messages"><StateView title="Unable to load conversations" description={query.error.message} /></Screen>;
  const conversations = query.data ?? [];
  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={conversations}
      keyExtractor={(conversation) => conversation.id}
      ListHeaderComponent={<View><Text style={styles.title}>Messages</Text><Text style={styles.subtitle}>Recent conversations</Text></View>}
      ListEmptyComponent={<StateView title="No conversations" description="Start a conversation to see it here." />}
      renderItem={({ item: conversation }) => (
        <Link href={{ pathname: '/messages/[conversationId]', params: { conversationId: conversation.id } }} asChild>
          <View style={styles.card}>
            <Text style={styles.name}>{conversation.name}</Text>
            <Text style={styles.preview}>{conversation.lastMessage?.content}</Text>
            {conversation.unreadCount > 0 ? <Text style={styles.unread}>{conversation.unreadCount} unread</Text> : null}
          </View>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  list: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 6 },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  preview: {
    color: '#4b5563',
  },
  unread: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
