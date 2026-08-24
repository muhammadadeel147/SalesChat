'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { StockMovementsPage } from '@/features/reports/StockMovementsPage';
import { FEATURES } from '@/lib/features';

export default function StockMovementsRoute() {
  return (
    <FeatureGate feature={FEATURES.REPORTS_VIEW}>
      <StockMovementsPage />
    </FeatureGate>
  );
}
