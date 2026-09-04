'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { ErrorState, LoadingState } from '../../components/State';
import { PostCard } from '../../components/PostCard';
export default function HomePage() { const query = useInfiniteQuery({ queryKey: ['feed'], queryFn: ({ pageParam }) => api.feed(pageParam), initialPageParam: undefined as string | undefined, getNextPageParam: (last) => last.hasMore ? last.nextCursor : undefined }); if (query.isLoading) return <Shell><LoadingState /></Shell>; if (query.isError) return <Shell><ErrorState message={query.error.message} /></Shell>; const posts = query.data?.pages.flatMap((page) => page.items) ?? []; return <Shell><div className="mb-6"><h1 className="text-3xl font-black">Your feed</h1><p className="mt-1 text-slate-500">Latest moments from your community.</p></div><div className="grid gap-4">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>{query.hasNextPage && <button className="button mt-6" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? 'Loading...' : 'Load more'}</button>}</Shell>; }
