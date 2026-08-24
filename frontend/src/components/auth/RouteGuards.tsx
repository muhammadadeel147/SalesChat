'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { PageLoader } from '@/components/ui/Spinner';
import { hasSessionFlag } from '@/lib/api-client';
import { getHomePath, isPlatformAdmin, canUsePosApp } from '@/lib/features';
import { useAuth } from '@/lib/auth';

function Redirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return <PageLoader />;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const hasSession = hasSessionFlag();

  if (isLoading) return <PageLoader />;
  if (!user && hasSession) return <PageLoader />;
  if (!user) return <Redirect to="/pos/login" />;
  if (user.mustChangePassword && pathname !== '/pos/change-password') {
    return <Redirect to="/pos/change-password" />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (user) return <Redirect to={getHomePath(user)} />;

  return <>{children}</>;
}

export function PosShellRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const hasSession = hasSessionFlag();

  if (isLoading) return <PageLoader />;
  if (!user && hasSession) return <PageLoader />;
  if (!user) return <Redirect to="/pos/login" />;
  if (isPlatformAdmin(user)) return <Redirect to="/admin" />;
  if (!canUsePosApp(user)) return <Redirect to="/pos/login" />;

  return <>{children}</>;
}

export function AdminShellRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const hasSession = hasSessionFlag();

  if (isLoading) return <PageLoader />;
  if (!user && hasSession) return <PageLoader />;
  if (!user) return <Redirect to="/pos/login" />;
  if (!isPlatformAdmin(user)) return <Redirect to="/pos" />;

  return <>{children}</>;
}
