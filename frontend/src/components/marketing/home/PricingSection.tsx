'use client';

import { useState } from 'react';
import { APP_TRIAL_URL } from '@/lib/constants';
import { formatPkr, PRICING_PLANS, type BillingCycle } from '@/lib/pricing';
import { Callout } from '../Callout';
import { Reveal } from '../Reveal';
import { Button } from '../Button';
import { MaterialIcon } from '../MaterialIcon';

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <section id="pricing" className="section-y relative z-10 w-full">
      <div className="site-shell">
        <div className="relative overflow-hidden rounded-site bg-pure-white px-5 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute left-8 top-10 hidden lg:block">
            <Callout rotate={-12} shiftY={-14} className="text-caramel">
              pick your pace
            </Callout>
          </div>
          <div className="pointer-events-none absolute right-10 top-16 hidden md:block">
            <Callout rotate={10} shiftY={16} className="text-secondary">
              no surprise fees
            </Callout>
          </div>

          {showHeading ? (
            <Reveal className="relative mb-8 text-center sm:mb-10">
              <h2 className="text-headline-lg mb-3 text-on-surface">Simple, Transparent Pricing</h2>
              <p className="text-body-md mx-auto mb-4 max-w-xl text-on-surface-variant">
                Choose the plan that fits your business needs.
              </p>
              <Callout rotate={-7} shiftY={-8} className="text-callout-xl text-caramel">
                Start small. Scale without drama.
              </Callout>
            </Reveal>
          ) : null}

          <div className="relative mb-8 flex flex-wrap items-center justify-center gap-3 sm:mb-10 sm:gap-4">
            <span
              className={`text-body-sm ${cycle === 'monthly' ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={cycle === 'yearly'}
              aria-label="Toggle billing cycle"
              onClick={() => setCycle((c) => (c === 'monthly' ? 'yearly' : 'monthly'))}
              className={`relative h-7 w-12 rounded-full border-2 transition-colors duration-300 focus:outline-none sm:h-8 sm:w-14 ${
                cycle === 'yearly'
                  ? 'border-primary bg-primary'
                  : 'border-outline-variant bg-pure-white'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-300 sm:top-0.5 sm:h-6 sm:w-6 ${
                  cycle === 'yearly' ? 'right-0.5 bg-pure-white' : 'left-0.5 bg-primary'
                }`}
              />
            </button>
            <span
              className={`text-body-sm ${cycle === 'yearly' ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}
            >
              Annually
            </span>
            <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:text-xs">
              Save 20%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:items-stretch">
            {PRICING_PLANS.map((plan, index) => {
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const period = cycle === 'monthly' ? '/mo' : '/yr';
              const featured = plan.popular;

              return (
                <Reveal key={plan.id} delay={index * 80} className="h-full">
                  <article
                    className={`flex h-full flex-col rounded-site p-5 text-center sm:p-6 ${
                      featured
                        ? 'relative bg-gradient-to-br from-[#059669] to-[#065f46] text-pure-white shadow-lg'
                        : 'border-2 border-dashed border-primary/40 bg-surface-container shadow-sm'
                    }`}
                  >
                    {featured ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-container px-3 py-0.5 font-label-caps text-on-primary-container">
                        Most Popular
                      </div>
                    ) : null}
                    <h3
                      className={`text-headline-md ${featured ? 'text-pure-white' : 'text-on-surface'}`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-body-sm mb-4 line-clamp-2 sm:mb-5 ${
                        featured ? 'text-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      {plan.tagline}
                    </p>
                    <div
                      className={`text-headline-lg mb-4 sm:mb-5 ${featured ? 'text-primary-container' : 'text-primary'}`}
                    >
                      {formatPkr(price)}
                      <span
                        className={`text-body-sm ${featured ? 'text-pure-white/75' : 'text-on-surface-variant'}`}
                      >
                        {period}
                        {plan.priceSuffix ? ` ${plan.priceSuffix}` : ''}
                      </span>
                    </div>
                    <ul
                      className={`mb-5 flex-grow space-y-2.5 text-left text-body-sm sm:mb-6 ${
                        featured ? 'text-pure-white/85' : 'text-on-surface-variant'
                      }`}
                    >
                      {plan.included.slice(0, 5).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <MaterialIcon
                            name="check"
                            className={`mt-0.5 shrink-0 text-[16px] ${featured ? 'text-primary-container' : 'text-primary'}`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      href={APP_TRIAL_URL}
                      variant={featured ? 'onBrown' : 'primary'}
                      size="sm"
                      className="w-full font-bold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Choose {plan.name}
                    </Button>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
