'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { CategoriesPage } from '@/features/inventory/CategoriesPage';
import { FEATURES } from '@/lib/features';

export default function CategoriesRoute() {
  return (
    <FeatureGate feature={FEATURES.INVENTORY_CATEGORIES}>
      <CategoriesPage />
    </FeatureGate>
  );
}
