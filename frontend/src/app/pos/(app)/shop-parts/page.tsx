'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { ShopPartsPage } from '@/features/inventory/ShopPartsPage';
import { FEATURES } from '@/lib/features';

export default function ShopPartsRoute() {
  return (
    <FeatureGate feature={FEATURES.INVENTORY_SHOP_PARTS}>
      <ShopPartsPage />
    </FeatureGate>
  );
}
