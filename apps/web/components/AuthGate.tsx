'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ApiError, api } from '../lib/api';
import { ErrorState, LoadingState } from './State';

const publicPaths = new Set(['/login', '/register']);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = publicPaths.has(pathname);
  const session = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: api.me,
    enabled: !isPublicPath,
    retry: false,
    staleTime: 60_000,
  });
  const isUnauthorized = session.error instanceof ApiError && session.error.status === 401;

  useEffect(() => {
    if (!isPublicPath && isUnauthorized) router.replace('/login');
  }, [isPublicPath, isUnauthorized, router]);

  if (isPublicPath) return children;
  if (session.isPending || isUnauthorized) return <LoadingState />;
  if (session.isError) return <ErrorState message={session.error.message} />;

  return children;
}
