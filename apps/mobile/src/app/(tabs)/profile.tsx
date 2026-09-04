import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { StateView } from '../../components/StateView';
import { profileApi } from '../../lib/api-client';

export default function ProfileScreen() {
  const query = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.getMe });
  if (query.isLoading) return <Screen title="Profile"><LoadingSkeleton /></Screen>;
  if (query.isError || !query.data) return <Screen title="Profile"><StateView title="Unable to load profile" description="Check your connection and try again." /></Screen>;
  const profile = query.data;
  return (
    <Screen title={profile.displayName} subtitle={`@${profile.username}`}>
      <View style={styles.card}>
        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.bio}>{profile.bio ?? 'Tell the community about yourself.'}</Text>
        <View style={styles.stats}>
          <Text>120 Posts</Text>
          <Text>4.8k Followers</Text>
          <Text>220 Following</Text>
        </View>
      </View>

      <Link href="/profile/edit" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Edit profile</Text>
        </Pressable>
      </Link>

      <Link href="/settings" asChild>
        <Pressable style={[styles.button, styles.secondary]}>
          <Text style={styles.buttonText}>Settings</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 18,
    gap: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  bio: {
    color: '#4b5563',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: '#111827',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
