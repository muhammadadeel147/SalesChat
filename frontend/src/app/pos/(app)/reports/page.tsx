'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { FEATURES } from '@/lib/features';

export default function ReportsRoute() {
  return (
    <FeatureGate feature={FEATURES.REPORTS_VIEW}>
      <ReportsPage />
    </FeatureGate>
  );
}
