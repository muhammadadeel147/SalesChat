'use client';

import { FeatureGate } from '@/components/billing/FeatureGate';
import { StaffPage } from '@/features/staff/StaffPage';
import { FEATURES } from '@/lib/features';

export default function StaffRoute() {
  return (
    <FeatureGate feature={FEATURES.USERS_MANAGE}>
      <StaffPage />
    </FeatureGate>
  );
}
