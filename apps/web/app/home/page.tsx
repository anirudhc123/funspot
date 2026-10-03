'use client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { ErrorState, LoadingState } from '../../components/State';
import { PostCard } from '../../components/PostCard';
export default function HomePage() {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const query = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => api.feed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.hasMore ? last.nextCursor : undefined,
  });
  const createPost = useMutation({
    mutationFn: api.createPost,
    onSuccess: async () => {
      setText('');
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const submitPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPost.mutate({ text });
  };

  if (query.isLoading) return <Shell><LoadingState /></Shell>;
  if (query.isError) return <Shell><ErrorState message={query.error.message} /></Shell>;
  const posts = query.data?.pages.flatMap((page) => page.items) ?? [];

  return <Shell>
    <div className="mb-6"><h1 className="text-3xl font-black">Your feed</h1><p className="mt-1 text-slate-500">Latest moments from your community.</p></div>
    <form className="mb-6 rounded-2xl border bg-white p-5 shadow-sm" onSubmit={submitPost}>
      <label className="mb-3 block font-bold" htmlFor="new-post">New post</label>
      <textarea id="new-post" className="field min-h-24 w-full resize-y" value={text} onChange={(event) => setText(event.target.value)} maxLength={5000} required placeholder="What's happening?" />
      {createPost.isError && <div className="mt-3"><ErrorState message={createPost.error.message} /></div>}
      <button className="button mt-3" type="submit" disabled={createPost.isPending || !text.trim()}>{createPost.isPending ? 'Posting...' : 'Post'}</button>
    </form>
    <div className="grid gap-4">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
    {query.hasNextPage && <button className="button mt-6" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? 'Loading...' : 'Load more'}</button>}
  </Shell>;
}
