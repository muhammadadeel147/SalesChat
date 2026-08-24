import type { Metadata } from 'next';
import { PricingSection } from '@/components/marketing/home/PricingSection';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { JsonLd } from '@/components/marketing/JsonLd';
import { BRAND } from '@/lib/constants';
import { pricingFaqs } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pricing',
  description: `Simple PKR pricing for ${BRAND.name}. Starter, Standard, and Pro plans for shops and growing businesses.`,
  path: '/pricing',
});

export default function PricingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <div className="relative w-full bg-surface">
        <section className="section-y-sm border-b border-outline-variant/20">
          <div className="site-shell">
            <p className="font-label-caps mb-3 tracking-widest text-caramel">Pricing</p>
            <h1 className="text-headline-xl mb-3 max-w-2xl text-on-surface">
              Plans for every stage of your business
            </h1>
            <p className="text-body-md max-w-xl text-on-surface-variant">
              Transparent PKR pricing synced with our live product plans. Start free, scale when
              ready.
            </p>
            <p className="font-callout-accent text-callout-accent mt-4 inline-block -translate-y-2 -rotate-6 text-caramel">
              Honest numbers. That&apos;s it.
            </p>
          </div>
        </section>
        <PricingSection showHeading={false} />
        <section className="section-y-sm border-t border-outline-variant/20 bg-surface-container-low">
          <div className="site-shell max-w-3xl">
            <h2 className="font-callout-accent text-callout-accent mb-5 text-caramel">
              Questions, answered
            </h2>
            <FAQAccordion items={[...pricingFaqs]} />
          </div>
        </section>
      </div>
    </>
  );
}
