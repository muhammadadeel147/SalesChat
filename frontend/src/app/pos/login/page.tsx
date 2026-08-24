'use client';

import { PublicOnlyRoute } from '@/components/auth/RouteGuards';
import { LoginPage } from '@/features/auth/LoginPage';

export default function PosLoginRoute() {
  return (
    <PublicOnlyRoute>
      <LoginPage />
    </PublicOnlyRoute>
  );
}
