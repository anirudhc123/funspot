import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';
import { Shell } from '../../../components/Shell';
export const dynamic = 'force-dynamic';
export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) { const { username } = await params; try { const user = await api.profile(username); return <Shell><div className="rounded-2xl border bg-white p-6"><h1 className="text-3xl font-black">{user.displayName}</h1><p className="text-blue-600">@{user.username}</p><p className="mt-4 text-slate-600">{user.bio ?? 'No bio yet.'}</p></div></Shell>; } catch { notFound(); } }
