'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { DiscountsPage } from '@/features/discounts/DiscountsPage';
import { FEATURES } from '@/lib/features';

export default function DiscountsRoute() {
  return (
    <FeatureGate feature={FEATURES.BILLING_DISCOUNT}>
      <DiscountsPage />
    </FeatureGate>
  );
}
