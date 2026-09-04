export function LoadingState() { return <div className="animate-pulse space-y-3"><div className="h-24 rounded-2xl bg-slate-200" /><div className="h-24 rounded-2xl bg-slate-200" /></div>; }
export function ErrorState({ message = 'Something went wrong.' }: { message?: string }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{message}</div>; }
