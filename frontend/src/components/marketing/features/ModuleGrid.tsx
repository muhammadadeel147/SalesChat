import Image from 'next/image';
import { MaterialIcon } from '../MaterialIcon';

function ModuleHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-pure-white shadow-sm sm:h-14 sm:w-14 sm:rounded-2xl">
        <MaterialIcon name={icon} className="text-[24px] text-primary sm:text-[28px]" />
      </div>
      <h2 className="text-headline-lg text-on-surface">{title}</h2>
    </div>
  );
}

export function ModuleGrid() {
  return (
    <section className="section-y w-full border-t-2 border-dashed border-primary/35 bg-surface-container-low">
      <div className="site-shell">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:gap-y-16 lg:grid-cols-2 lg:gap-x-16">
          <div className="flex flex-col" id="pos">
            <ModuleHeader icon="point_of_sale" title="POS Engine" />
            <p className="text-body-sm mb-5 text-on-surface-variant sm:mb-6 sm:text-body-md">
              The core of SaleChat&apos;s transactional power. Fast checkout with offline
              resilience, integrated payments, and automated tax compliance.
            </p>
            <div className="mt-auto grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg border-2 border-dashed border-primary/35 bg-surface-container p-3 sm:rounded-xl sm:p-4">
                <MaterialIcon name="offline_bolt" className="mb-1.5 text-primary sm:mb-2" />
                <h4 className="text-body-md font-medium text-on-surface">Offline Mode</h4>
                <p className="text-body-sm mt-0.5 text-on-surface-variant">Continuous sync.</p>
              </div>
              <div className="rounded-lg border-2 border-dashed border-primary/35 bg-surface-container p-3 sm:rounded-xl sm:p-4">
                <MaterialIcon name="speed" className="mb-1.5 text-primary sm:mb-2" />
                <h4 className="text-body-md font-medium text-on-surface">Sub-second</h4>
                <p className="text-body-sm mt-0.5 text-on-surface-variant">Transaction speed.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:mt-10" id="erp">
            <ModuleHeader icon="account_tree" title="ERP Core" />
            <p className="text-body-sm mb-5 text-on-surface-variant sm:mb-6 sm:text-body-md">
              Robust backbone for inventory, procurement, and operations with smart reorder points
              and end-to-end visibility.
            </p>
            <div className="group relative mt-auto overflow-hidden rounded-xl border-2 border-dashed border-primary/35 bg-pure-white p-4 shadow-[var(--shadow-card)] sm:rounded-2xl sm:p-5">
              <div className="absolute inset-0 translate-y-full bg-caramel/5 transition-transform duration-500 ease-out group-hover:translate-y-0" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-label-caps text-on-surface-variant">
                    Live Inventory Sync
                  </span>
                  <MaterialIcon name="sync" className="text-sm text-primary" />
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container sm:h-2">
                  <div className="relative h-full w-[85%] rounded-full bg-caramel">
                    <div className="absolute inset-0 animate-pulse bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col" id="rms">
            <ModuleHeader icon="storefront" title="RMS Suite" />
            <p className="text-body-sm mb-4 text-on-surface-variant sm:mb-5 sm:text-body-md">
              Restaurant Management designed for multi-location scaling with consolidated reporting
              and dynamic pricing.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-dashed border-primary/35 shadow-sm sm:w-[58%] sm:rounded-2xl">
                <Image
                  src="/hero-rms.png"
                  alt="Restaurant RMS — floor and kitchen operations"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 28vw"
                />
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-on-primary-container/75 px-2.5 py-0.5 font-label-caps text-pure-white backdrop-blur-sm">
                  RMS
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 sm:gap-2.5">
                <p className="font-caveat text-[1.35rem] font-semibold leading-tight text-caramel sm:text-[1.5rem]">
                  Floor to kitchen, linked.
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Orders, tables, and stock stay in sync so service stays fast — even across
                  locations.
                </p>
                <ul className="mt-1 space-y-2">
                  {[
                    'Multi-store consolidated dashboards',
                    'Global SKU & variant management',
                    'Staff permission tiers',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <MaterialIcon
                        name="check_circle"
                        className="mt-0.5 text-[16px] text-primary"
                      />
                      <span className="text-body-sm text-on-surface">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col" id="hms">
            <ModuleHeader icon="medical_services" title="HMS Module" />
            <p className="text-body-sm mb-4 text-on-surface-variant sm:mb-5 sm:text-body-md">
              Hospitality Management bridging front-of-house service and back-of-house inventory in
              one unified hub.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-dashed border-primary/35 shadow-sm sm:w-[58%] sm:rounded-2xl">
                <Image
                  src="/hero-hms.png"
                  alt="Hotel HMS — reception desk and guest check-in"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 28vw"
                />
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-on-primary-container/75 px-2.5 py-0.5 font-label-caps text-pure-white backdrop-blur-sm">
                  HMS
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 sm:gap-2.5">
                <p className="font-caveat text-[1.35rem] font-semibold leading-tight text-caramel sm:text-[1.5rem]">
                  Guest stay, one folio.
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Room charges, F&amp;B, and POS tabs flow into a single guest bill — no late-night
                  reconciliation.
                </p>
                <ul className="mt-1 space-y-2">
                  {[
                    'Room + POS folio sync',
                    'Housekeeping status live',
                    'Multi-property ready',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <MaterialIcon
                        name="check_circle"
                        className="mt-0.5 text-[16px] text-primary"
                      />
                      <span className="text-body-sm text-on-surface">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CustomErpCta() {
  return (
    <section className="section-y-sm relative w-full border-t-2 border-dashed border-primary/30 bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-caramel/5" />
      <div className="site-shell relative z-10 text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary bg-pure-white shadow-sm sm:mb-6 sm:h-[4.5rem] sm:w-[4.5rem]">
          <MaterialIcon
            name="dashboard_customize"
            className="text-[32px] text-primary sm:text-[36px]"
          />
        </div>
        <h2 className="text-headline-lg mb-4 text-on-surface sm:mb-5">Custom ERP Solutions</h2>
        <p className="text-body-md mx-auto mb-6 max-w-xl text-on-surface-variant sm:mb-8">
          We build tailor-made SaleChat ERP architectures designed for your unique operational
          workflows.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-full border-2 border-dashed border-primary bg-pure-white px-6 py-2.5 text-body-md font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary sm:px-8 sm:py-3"
        >
          Discuss Your Custom Needs
        </a>
      </div>
    </section>
  );
}
