'use client';

import { useEffect } from 'react';
import { Navigate } from '@/lib/next-nav';

import { useSettingsDialog } from '@/features/settings/settings-dialog-context';

/** Deep-link: open Claude-style settings window, then return home. */
export function SettingsPage() {
  const { openSettings } = useSettingsDialog();

  useEffect(() => {
    openSettings('business');
  }, [openSettings]);

  return <Navigate to="/pos" replace />;
}
