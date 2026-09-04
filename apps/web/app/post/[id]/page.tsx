import { api } from '../../../lib/api';
import { Shell } from '../../../components/Shell';
import { PostCard } from '../../../components/PostCard';
export const dynamic = 'force-dynamic';
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const post = await api.post(id); return <Shell><PostCard post={post} /></Shell>; }
