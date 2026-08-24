export type PlanId = 'STARTER' | 'STANDARD' | 'PRO';

export type PricingPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyNote?: string;
  priceSuffix?: string;
  popular?: boolean;
  included: string[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    tagline:
      'Core billing for a single counter. Best for small shops just getting started with digital billing.',
    monthlyPrice: 2500,
    yearlyPrice: 25000,
    included: [
      'Sales register (cart, barcode, search)',
      'Cash Sale / Full Udhaar / Split Udhaar',
      'Stock tracking + low-stock alerts',
      'Basic receipt print',
      'Sales history (view only)',
    ],
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    tagline:
      'Everything growing shops need — held bills, discounts, staff accounts, full udhaar ledger and reports.',
    monthlyPrice: 4500,
    yearlyPrice: 45000,
    yearlyNote: '2 months free on yearly',
    popular: true,
    included: [
      'Everything in Starter',
      'Held bills (park / resume)',
      'Discounts & staff permissions',
      'Full udhaar ledger + statements',
      'Sales & growth reports',
      'Receipt branding',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    tagline:
      'For multi-branch operations that need FBR invoicing, priority support and unlimited catalog size.',
    monthlyPrice: 7500,
    yearlyPrice: 75000,
    priceSuffix: 'per location',
    included: [
      'Everything in Standard',
      'Multi-branch switcher & access',
      'FBR invoice / QR fields (Pakistan)',
      'Unlimited products & staff logins',
      'Priority support',
      'Cloud hosting + daily auto backups',
    ],
  },
];

export function formatPkr(amount: number): string {
  return `${amount.toLocaleString('en-PK')} Rs`;
}

export type BillingCycle = 'monthly' | 'yearly';
