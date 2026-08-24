'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { BrandsPage } from '@/features/catalog/BrandsPage';
import { FEATURES } from '@/lib/features';

export default function BrandsRoute() {
  return (
    <FeatureGate feature={FEATURES.INVENTORY_BRANDS}>
      <BrandsPage />
    </FeatureGate>
  );
}
