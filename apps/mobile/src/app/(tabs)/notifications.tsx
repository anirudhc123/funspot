import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { StateView } from '../../components/StateView';
import { notificationsApi } from '../../lib/api-client';

export default function NotificationsScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  });

  if (isLoading) {
    return <View style={styles.page}><LoadingSkeleton /></View>;
  }

  if (isError || !data) {
    return <View style={styles.page}><StateView title="Unable to load notifications" description="Check your connection and try again." /></View>;
  }

  return (
    <View style={styles.page}>
      <Text style={styles.heading}>Notifications</Text>
      {data.length === 0 ? (
        <StateView title="Nothing new" description="Check back later for updates." />
      ) : (
        data.map((item) => (
        <Pressable key={item.id} onPress={() => item.read ? undefined : void notificationsApi.markRead(item.id)} style={[styles.item, item.read ? styles.read : styles.unread]}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  item: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  unread: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  read: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  type: {
    color: '#2563eb',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    color: '#4b5563',
  },
});
