'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { api, type Post } from '../lib/api';
import { ErrorState, LoadingState } from './State';

export function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const viewer = useQuery({ queryKey: ['auth', 'session'], queryFn: api.me, staleTime: 60_000 });
  const commentsQuery = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => api.comments(post.id),
    enabled: showComments,
  });
  const likeMutation = useMutation<
    Awaited<ReturnType<typeof api.like>> | Awaited<ReturnType<typeof api.unlike>>,
    Error,
    boolean,
    { previousLiked: boolean }
  >({
    mutationFn: async (nextLiked) => {
      if (nextLiked) return api.like(post.id);
      return api.unlike(post.id);
    },
    onMutate: async (nextLiked) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousLiked = liked;
      setLiked(nextLiked);
      return { previousLiked };
    },
    onError: (_error, _nextLiked, context) => setLiked(context?.previousLiked ?? false),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });
  const saveMutation = useMutation<
    Awaited<ReturnType<typeof api.save>> | Awaited<ReturnType<typeof api.unsave>>,
    Error,
    boolean,
    { previousSaved: boolean }
  >({
    mutationFn: async (nextSaved) => {
      if (nextSaved) return api.save(post.id);
      return api.unsave(post.id);
    },
    onMutate: (nextSaved) => {
      const previousSaved = saved;
      setSaved(nextSaved);
      return { previousSaved };
    },
    onError: (_error, _nextSaved, context) => setSaved(context?.previousSaved ?? false),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });
  const shareMutation = useMutation({
    mutationFn: () => api.share(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: () => api.deletePost(post.id),
    onSuccess: async () => {
      setDeleted(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
        queryClient.invalidateQueries({ queryKey: ['post', post.id] }),
      ]);
    },
  });
  const commentMutation = useMutation({
    mutationFn: (text: string) => api.comment(post.id, { text }),
    onSuccess: async () => {
      setCommentText('');
      await queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: api.deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', post.id] }),
  });

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commentMutation.mutate(commentText);
  };

  if (deleted) return null;
  const mutationError = likeMutation.error ?? saveMutation.error ?? shareMutation.error ?? deleteMutation.error ?? commentMutation.error ?? deleteCommentMutation.error;
  const authorName = viewer.data?.id === post.authorId ? viewer.data.username : undefined;

  return <article className="rounded-2xl border bg-white p-5 shadow-sm">
    {authorName
      ? <Link className="font-bold text-blue-700" href={`/profile/${encodeURIComponent(authorName)}`}>@{authorName}</Link>
      : <p className="font-bold text-slate-600">Funspot member</p>}
    <p className="mt-3 whitespace-pre-wrap text-slate-800">{post.text || 'Shared a post.'}</p>
    {post.hashtags.length > 0 && <p className="mt-3 text-sm text-blue-600">{post.hashtags.map((tag) => `#${tag}`).join(' ')}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <button className={`font-semibold ${liked ? 'text-blue-700' : 'text-slate-500'}`} onClick={() => likeMutation.mutate(!liked)} disabled={likeMutation.isPending}>{liked ? 'Liked' : 'Like'}</button>
      <button className="font-semibold text-slate-500" onClick={() => setShowComments((visible) => !visible)}>{showComments ? 'Hide comments' : 'Comment'}</button>
      <button className={`font-semibold ${saved ? 'text-blue-700' : 'text-slate-500'}`} onClick={() => saveMutation.mutate(!saved)} disabled={saveMutation.isPending}>{saved ? 'Saved' : 'Save'}</button>
      <button className="font-semibold text-slate-500" onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending}>{shareMutation.isPending ? 'Sharing...' : 'Share'}</button>
      {viewer.data?.id === post.authorId && <button className="font-semibold text-red-600" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</button>}
    </div>
    <Link className="mt-4 inline-block text-sm font-semibold text-slate-500" href={`/post/${post.id}`}>View post</Link>
    {mutationError && <div className="mt-3"><ErrorState message={mutationError.message} /></div>}
    {showComments && <section className="mt-4 border-t pt-4">
      <form className="flex gap-2" onSubmit={submitComment}>
        <input className="field min-w-0 flex-1" value={commentText} onChange={(event) => setCommentText(event.target.value)} maxLength={5000} required placeholder="Write a comment..." />
        <button className="button" type="submit" disabled={commentMutation.isPending || !commentText.trim()}>{commentMutation.isPending ? 'Sending...' : 'Send'}</button>
      </form>
      {commentsQuery.isLoading && <div className="mt-4"><LoadingState /></div>}
      {commentsQuery.isError && <div className="mt-4"><ErrorState message={commentsQuery.error.message} /></div>}
      {commentsQuery.data?.items.map((comment) => <div className="mt-4 flex items-start justify-between gap-3" key={comment.id}>
        <div><p className="font-semibold text-slate-700">@{comment.userId}</p><p className="whitespace-pre-wrap text-slate-600">{comment.text}</p></div>
        {viewer.data?.id === comment.userId && <button className="text-sm font-semibold text-red-600" onClick={() => deleteCommentMutation.mutate(comment.id)} disabled={deleteCommentMutation.isPending}>Delete</button>}
      </div>)}
    </section>}
  </article>;
}
