import { useInfiniteQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PostCard } from '../../components/PostCard';
import { StateView } from '../../components/StateView';
import { feedApi } from '../../lib/api-client';

export default function HomeScreen() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => feedApi.getFeedPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  if (isLoading) {
    return (
      <View style={styles.page}>
        <Text style={styles.heading}>Home</Text>
        <LoadingSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.page}>
        <StateView title="We hit a snag" description={error instanceof Error ? error.message : 'Unable to load your feed.'} />
      </View>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.page}
      data={posts}
      keyExtractor={(post) => post.id}
      ListHeaderComponent={<Text style={styles.heading}>Home</Text>}
      ListEmptyComponent={<StateView title="No posts yet" description="Follow people and share a new update." action={<Pressable onPress={() => void refetch()} style={styles.action}><Text style={styles.actionText}>Refresh</Text></Pressable>} />}
      ListFooterComponent={hasNextPage ? <Pressable onPress={() => void fetchNextPage()} style={styles.action}><Text style={styles.actionText}>{isFetchingNextPage ? 'Loading...' : 'Load more'}</Text></Pressable> : undefined}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      renderItem={({ item: post }) => <PostCard post={{ ...post, privacy: post.privacy as 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE', hashtags: post.hashtags, mentions: [], updatedAt: post.createdAt }} />}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    gap: 16,
  },
  list: { flex: 1, backgroundColor: '#f3f4f6' },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  action: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
