'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { SalePage } from '@/features/billing/SalePage';
import { FEATURES } from '@/lib/features';

export default function SaleRoute() {
  return (
    <FeatureGate feature={FEATURES.BILLING_CREATE_SALE}>
      <SalePage />
    </FeatureGate>
  );
}
