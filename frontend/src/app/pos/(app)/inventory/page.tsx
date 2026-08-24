'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { FEATURES } from '@/lib/features';

export default function InventoryRoute() {
  return (
    <FeatureGate feature={FEATURES.INVENTORY_VIEW}>
      <InventoryPage />
    </FeatureGate>
  );
}
