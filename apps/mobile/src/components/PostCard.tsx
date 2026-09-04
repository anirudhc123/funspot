import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import type { Post } from '../types';

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => (
  <Link href={{ pathname: '/post/[id]', params: { id: post.id } }} asChild>
    <View style={styles.card}>
      <Text style={styles.author}>@{post.authorId}</Text>
      <Text style={styles.text}>{post.text}</Text>
      {post.hashtags.length > 0 ? <Text style={styles.meta}>{post.hashtags.map((tag) => `#${tag}`).join(' ')}</Text> : null}
      <Text style={styles.meta}>{post.privacy}</Text>
    </View>
  </Link>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 8,
  },
  author: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  text: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: '#6b7280',
    fontSize: 12,
  },
});
