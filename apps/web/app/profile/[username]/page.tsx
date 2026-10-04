'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Shell } from '../../../components/Shell';
import { ErrorState, LoadingState } from '../../../components/State';
import { api } from '../../../lib/api';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const queryClient = useQueryClient();
  const [followState, setFollowState] = useState<'following' | 'not-following' | 'pending'>('not-following');
  const profile = useQuery({ queryKey: ['profile', username], queryFn: () => api.profile(username) });
  const followMutation = useMutation<
    Awaited<ReturnType<typeof api.follow>> | Awaited<ReturnType<typeof api.unfollow>>,
    Error,
    boolean,
    { previousState: 'following' | 'not-following' | 'pending' }
  >({
    mutationFn: async (nextFollowing) => {
      const userId = profile.data?.id;
      if (!userId) throw new Error('Profile was not found.');
      if (nextFollowing) return api.follow(userId);
      return api.unfollow(userId);
    },
    onMutate: (nextFollowing) => {
      const previousState = followState;
      setFollowState(nextFollowing ? 'following' : 'not-following');
      return { previousState };
    },
    onError: (_error, _nextFollowing, context) => setFollowState(context?.previousState ?? 'not-following'),
    onSuccess: async (result, nextFollowing) => {
      setFollowState(!nextFollowing ? 'not-following' : 'status' in result && result.status === 'pending' ? 'pending' : 'following');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', username] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ]);
    },
  });

  if (profile.isLoading) return <Shell><LoadingState /></Shell>;
  if (profile.isError) return <Shell><ErrorState message={profile.error.message} /></Shell>;

  const user = profile.data;
  if (!user) return <Shell><ErrorState message="Profile was not found." /></Shell>;

  return <Shell>
    <div className="rounded-2xl border bg-white p-6">
      <h1 className="text-3xl font-black">{user.displayName}</h1>
      <p className="text-blue-600">@{user.username}</p>
      <p className="mt-4 text-slate-600">{user.bio ?? 'No bio yet.'}</p>
      {user.id !== (queryClient.getQueryData<{ id: string }>(['auth', 'session'])?.id) && <button className="button mt-5" onClick={() => followMutation.mutate(followState !== 'following')} disabled={followMutation.isPending || followState === 'pending'}>{followMutation.isPending ? 'Updating...' : followState === 'pending' ? 'Request pending' : followState === 'following' ? 'Unfollow' : 'Follow'}</button>}
      {followMutation.isError && <div className="mt-3"><ErrorState message={followMutation.error.message} /></div>}
    </div>
  </Shell>;
}
