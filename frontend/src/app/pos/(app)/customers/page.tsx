'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { FEATURES } from '@/lib/features';

export default function CustomersRoute() {
  return (
    <FeatureGate feature={FEATURES.CUSTOMERS_VIEW}>
      <CustomersPage />
    </FeatureGate>
  );
}
