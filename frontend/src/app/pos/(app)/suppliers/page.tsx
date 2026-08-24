'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { SuppliersPage } from '@/features/catalog/SuppliersPage';
import { FEATURES } from '@/lib/features';

export default function SuppliersRoute() {
  return (
    <FeatureGate feature={FEATURES.INVENTORY_SUPPLIERS}>
      <SuppliersPage />
    </FeatureGate>
  );
}
