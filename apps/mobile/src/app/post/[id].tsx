import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { feedApi } from '../../lib/api-client';

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['post', id], queryFn: () => feedApi.getPost(id), enabled: Boolean(id) });

  if (query.isLoading) return <Screen title="Post details"><LoadingSkeleton /></Screen>;
  if (query.isError) return <Screen title="Post details"><StateView title="Unable to load post" description={query.error.message} /></Screen>;
  if (!query.data) return <Screen title="Post details"><StateView title="Post not found" description="This post is no longer visible." /></Screen>;

  return (
    <Screen title="Post details">
      <View style={styles.card}>
        <Text style={styles.author}>@{query.data.authorId}</Text>
        <Text style={styles.body}>{query.data.text ?? 'No text content'}</Text>
        {query.data.hashtags.length > 0 ? <Text style={styles.meta}>{query.data.hashtags.map((tag) => `#${tag}`).join(' ')}</Text> : null}
        <Text style={styles.meta}>{query.data.privacy}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 18, gap: 10 },
  author: { color: '#2563eb', fontWeight: '700' },
  body: { color: '#111827', fontSize: 16, lineHeight: 24 },
  meta: { color: '#6b7280', fontSize: 12 },
});
