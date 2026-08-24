'use client';

import { Suspense, type ReactNode } from 'react';

import { AdminShellRoute, ProtectedRoute } from '@/components/auth/RouteGuards';
import { AdminAppShell } from '@/components/layout/AdminAppShell';
import { PageLoader } from '@/components/ui/Spinner';

export default function AdminAppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminShellRoute>
        <AdminAppShell>
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
        </AdminAppShell>
      </AdminShellRoute>
    </ProtectedRoute>
  );
}
