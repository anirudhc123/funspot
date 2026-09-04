'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { ErrorState, LoadingState } from '../../components/State';
export default function MessagesPage() { const query = useQuery({ queryKey: ['conversations'], queryFn: api.conversations }); if (query.isLoading) return <Shell><LoadingState /></Shell>; if (query.isError) return <Shell><ErrorState message={query.error.message} /></Shell>; return <Shell><h1 className="text-3xl font-black">Messages</h1><div className="mt-6 grid gap-3">{query.data?.map((conversation) => <Link className="rounded-2xl border bg-white p-5 hover:border-blue-300" href={`/messages/${conversation.id}`} key={conversation.id}><p className="font-bold">{conversation.name ?? 'Conversation'}</p><p className="text-sm text-slate-500">{conversation.unreadCount} unread</p></Link>)}</div></Shell>; }
