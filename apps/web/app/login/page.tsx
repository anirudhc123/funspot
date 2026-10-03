'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
type Form = { email: string; password: string };
export default function LoginPage() { const router = useRouter(); const queryClient = useQueryClient(); const { register, handleSubmit, formState: { isSubmitting } } = useForm<Form>(); const submit = async (values: Form) => { await api.login(values); queryClient.removeQueries({ queryKey: ['auth', 'session'] }); router.push('/home'); }; return <main className="flex min-h-screen items-center justify-center px-4"><section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm"><p className="text-2xl font-black text-blue-600">Funspot</p><h1 className="mt-8 text-3xl font-bold">Welcome back</h1><p className="mb-8 mt-2 text-slate-500">Log in to continue.</p><form className="grid gap-4" onSubmit={handleSubmit(submit)}><input className="field" placeholder="Email" type="email" {...register('email', { required: true })} /><input className="field" placeholder="Password" type="password" {...register('password', { required: true })} /><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Log in'}</button></form><Link className="mt-5 block text-center text-sm text-blue-600" href="/register">Create an account</Link></section></main>; }
