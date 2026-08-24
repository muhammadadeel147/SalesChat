'use client';

import { Suspense, type ReactNode } from 'react';

import { PosShellRoute, ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/AppShell';
import { PageLoader } from '@/components/ui/Spinner';

export default function PosAppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <PosShellRoute>
        <AppShell>
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
        </AppShell>
      </PosShellRoute>
    </ProtectedRoute>
  );
}
