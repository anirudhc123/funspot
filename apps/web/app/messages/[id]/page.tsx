import { api } from '../../../lib/api';
import { Shell } from '../../../components/Shell';
export const dynamic = 'force-dynamic';
export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const messages = await api.messages(id); return <Shell><h1 className="text-3xl font-black">Conversation</h1><div className="mt-6 grid gap-3">{messages.map((message) => <div className="max-w-xl rounded-2xl border bg-white p-4" key={message.id}>{message.content}</div>)}</div></Shell>; }
