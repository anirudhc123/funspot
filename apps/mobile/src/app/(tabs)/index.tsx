import { useInfiniteQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.page}>
      <Text style={styles.heading}>Home</Text>
      {posts.length === 0 ? (
        <StateView title="No posts yet" description="Follow people and share a new update." action={<Pressable onPress={() => void refetch()} style={styles.action}><Text style={styles.actionText}>Refresh</Text></Pressable>} />
      ) : (
        <>
          {posts.map((post) => <PostCard key={post.id} post={{ ...post, privacy: post.privacy as 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE', hashtags: post.hashtags, mentions: [], updatedAt: post.createdAt }} />)}
          {hasNextPage ? <Pressable onPress={() => void fetchNextPage()} style={styles.action}><Text style={styles.actionText}>{isFetchingNextPage ? 'Loading...' : 'Load more'}</Text></Pressable> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
    gap: 16,
  },
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
