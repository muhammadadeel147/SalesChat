'use client';

import type { ReactNode } from 'react';

import { Navigate } from '@/lib/next-nav';
import { useAuth } from '@/lib/auth';
import { featureLabel, hasPlanFeature } from '@/lib/features';
import type { FeatureKey } from '@/lib/shared';

type FeatureGateProps = {
  feature: FeatureKey;
  children?: ReactNode;
  featureLabel?: string;
  className?: string;
};

/** Locked features redirect to the pricing / upgrade page. */
export function FeatureGate({ feature, children, featureLabel: labelOverride }: FeatureGateProps) {
  const { user } = useAuth();
  if (hasPlanFeature(user, feature)) {
    return <>{children}</>;
  }
  return (
    <Navigate
      to="/pos/upgrade"
      replace
      state={{ fromFeature: labelOverride ?? featureLabel(feature) }}
    />
  );
}
