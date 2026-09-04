'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Shell } from '../../components/Shell';
import { ErrorState, LoadingState } from '../../components/State';
export default function NotificationsPage() { const query = useQuery({ queryKey: ['notifications'], queryFn: api.notifications }); if (query.isLoading) return <Shell><LoadingState /></Shell>; if (query.isError) return <Shell><ErrorState message={query.error.message} /></Shell>; return <Shell><h1 className="text-3xl font-black">Notifications</h1><div className="mt-6 grid gap-3">{query.data?.map((item) => <article className={`rounded-2xl border p-5 ${item.read ? 'bg-white' : 'bg-blue-50'}`} key={item.id}><p className="font-bold">{item.title}</p><p className="mt-1 text-slate-600">{item.body}</p></article>)}</div></Shell>; }
