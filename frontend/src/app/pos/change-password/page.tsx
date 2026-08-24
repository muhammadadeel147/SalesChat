'use client';

import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage';

export default function ChangePasswordRoute() {
  return (
    <ProtectedRoute>
      <ChangePasswordPage />
    </ProtectedRoute>
  );
}
