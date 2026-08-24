'use client';

import { useEffect } from 'react';
import { Navigate } from '@/lib/next-nav';

import { useAdminPasswordDialog } from '@/features/settings/admin-password-dialog-context';

export function AdminAccountPasswordPage() {
  const { openPasswordSettings } = useAdminPasswordDialog();

  useEffect(() => {
    openPasswordSettings();
  }, [openPasswordSettings]);

  return <Navigate to="/admin" replace />;
}
