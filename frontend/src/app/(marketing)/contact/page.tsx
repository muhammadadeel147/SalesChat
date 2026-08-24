import type { Metadata } from 'next';
import { ContactForm } from '@/components/marketing/ContactForm';
import { MaterialIcon } from '@/components/marketing/MaterialIcon';
import { BRAND } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: `Contact ${BRAND.name} for demos, pricing, custom cloud systems, or support. ${BRAND.productBy}.`,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="relative w-full overflow-hidden bg-surface">
      <div className="pointer-events-none absolute -left-40 -top-40 h-72 w-72 rounded-full bg-primary-container/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-80 w-80 rounded-full bg-tertiary-container/5 blur-[120px]" />

      <section className="section-y relative z-10 w-full">
        <div className="site-shell">
          <div className="mb-8 max-w-2xl md:mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
              <span className="font-label-caps tracking-wider text-on-surface-variant">
                Get in Touch
              </span>
            </div>
            <h1 className="text-headline-xl relative mb-4 text-on-surface">
              Let&apos;s streamline your <br className="hidden md:block" />
              <span className="relative inline-block">
                operations together.
                <svg
                  className="absolute -bottom-1 left-0 h-2 w-full text-primary-container/30"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Our experts are ready to design a bespoke implementation plan for your multi-vertical
              needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="group relative overflow-hidden rounded-site border-2 border-dashed border-primary/40 bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6 lg:col-span-7 lg:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-primary-container/5 to-transparent" />
              <ContactForm />
            </div>

            <aside className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
              <div className="group relative overflow-hidden rounded-site bg-gradient-to-br from-[#059669] to-[#065f46] p-6 text-pure-white shadow-lg transition-transform duration-500 hover:scale-[1.01] sm:p-7">
                <h3 className="text-headline-md mb-5 flex items-center gap-2.5">
                  <MaterialIcon name="domain" className="text-primary-container" filled />
                  Contact {BRAND.company}
                </h3>
                <address className="space-y-3.5 not-italic text-body-sm text-primary-container sm:text-body-md">
                  <p className="flex items-start gap-2.5">
                    <MaterialIcon
                      name="location_on"
                      className="mt-0.5 text-[18px] text-primary-container"
                    />
                    <span>Pakistan · Remote-first support</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <MaterialIcon name="call" className="text-[18px] text-primary-container" />
                    <a
                      href={`tel:${BRAND.phone.replace(/\s/g, '')}`}
                      className="transition-colors hover:text-pure-white"
                    >
                      {BRAND.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <MaterialIcon name="chat" className="text-[18px] text-primary-container" />
                    <a
                      href={BRAND.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-pure-white"
                    >
                      WhatsApp {BRAND.whatsapp}
                    </a>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <MaterialIcon name="mail" className="text-[18px] text-primary-container" />
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="transition-colors hover:text-pure-white"
                    >
                      {BRAND.email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <MaterialIcon name="schedule" className="text-[18px] text-primary-container" />
                    <span>{BRAND.supportHours}</span>
                  </p>
                </address>
              </div>

              <div className="relative rounded-site border-2 border-dashed border-primary/50 bg-secondary-container/30 p-5 sm:p-6">
                <div className="font-callout-accent text-callout-accent inline-block -translate-y-2 -rotate-6 text-secondary">
                  Support response time
                  <br />
                  usually &lt; 2 hours!
                </div>
                <p className="font-callout-accent text-callout-accent mt-3 inline-block translate-y-3 rotate-8 text-caramel">
                  We actually pick up.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
