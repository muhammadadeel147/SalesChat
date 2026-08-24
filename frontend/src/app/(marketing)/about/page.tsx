import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/marketing/Button';
import { APP_SIGNUP_URL, BRAND } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description: `Learn about ${BRAND.name} — ${BRAND.productBy}. Cloud POS, ERP, RMS, and HMS for growing businesses.`,
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="section-y w-full">
      <div className="site-shell">
        <p className="font-label-caps mb-3 tracking-widest text-caramel">About</p>
        <h1 className="text-headline-xl mb-4 max-w-2xl text-on-surface sm:mb-5">
          Business software that matches how you actually work
        </h1>
        <p className="text-body-md mb-8 max-w-xl text-on-surface-variant sm:mb-10">
          {BRAND.name} exists so retailers, restaurants, hotels, and growing brands get cloud
          systems that feel custom — without enterprise bloat. {BRAND.productBy}.
        </p>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:mb-12">
          <article className="rounded-xl border-2 border-dashed border-primary/40 bg-surface-container p-5 sm:rounded-2xl sm:p-6">
            <h2 className="text-headline-md mb-3 text-on-surface">Our mission</h2>
            <p className="text-body-sm text-on-surface-variant sm:text-body-md">
              Strong tools should not require a six-month implementation. We build POS, ERP, RMS,
              and HMS that teams can learn quickly.
            </p>
          </article>
          <article className="rounded-xl border-2 border-dashed border-primary/40 bg-surface-container p-5 sm:rounded-2xl sm:p-6">
            <h2 className="text-headline-md mb-3 text-on-surface">Product story</h2>
            <p className="text-body-sm text-on-surface-variant sm:text-body-md">
              {BRAND.name} started as a focused cloud POS and grew into a full suite on one
              backbone.
            </p>
          </article>
        </div>

        <p className="font-callout-accent text-callout-xl mb-4 -translate-y-2 -rotate-8 text-caramel">
          Built by {BRAND.company}
        </p>
        <p className="text-body-sm mb-8 max-w-xl text-on-surface-variant sm:mb-10 sm:text-body-md">
          <Link href={BRAND.companyUrl} className="text-primary hover:underline">
            {BRAND.company}
          </Link>{' '}
          designs and ships {BRAND.name} for businesses that need practical cloud systems.
        </p>

        <Button href={APP_SIGNUP_URL} size="md">
          Start free trial
        </Button>
      </div>
    </div>
  );
}
