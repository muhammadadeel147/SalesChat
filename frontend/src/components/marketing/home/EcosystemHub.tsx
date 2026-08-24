import { Callout } from '../Callout';
import { Reveal } from '../Reveal';
import { MaterialIcon } from '../MaterialIcon';

const nodes = {
  left: [
    {
      icon: 'restaurant',
      iconBg: 'bg-secondary-container text-on-secondary-container',
      title: 'Restaurant Mgmt (RMS)',
      description: 'Menu costing, table mapping, and kitchen display integration.',
    },
    {
      icon: 'inventory_2',
      iconBg: 'bg-tertiary-container text-on-tertiary-container',
      title: 'Inventory System',
      description: 'Real-time stock depletion and automated purchase orders.',
    },
  ],
  right: [
    {
      icon: 'bed',
      iconBg: 'bg-[#c3e8fd] text-[#001f2a]',
      title: 'Hotel Mgmt (HMS)',
      description: 'Room charges, folio routing, and guest profile syncing.',
    },
    {
      icon: 'dashboard_customize',
      iconBg: 'bg-primary-container text-on-primary-container',
      title: 'Custom ERP Modules',
      description: 'Accounting, HR, and custom API connections.',
    },
  ],
} as const;

function NodeCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="w-full max-w-sm rounded-xl border-2 border-dashed border-primary/40 bg-surface-container p-4 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5 md:max-w-[240px]">
      <div
        className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full sm:mb-4 sm:h-11 sm:w-11 ${iconBg}`}
      >
        <MaterialIcon name={icon} className="text-[20px]" />
      </div>
      <h4 className="text-headline-md mb-1.5 text-on-surface">{title}</h4>
      <p className="text-body-sm text-on-surface-variant">{description}</p>
    </div>
  );
}

export function EcosystemHub() {
  return (
    <section className="section-y relative isolate z-10 w-full overflow-hidden">
      <div className="site-shell">
        <Reveal className="mb-8 text-center sm:mb-10">
          <h2 className="text-headline-lg mb-3 text-on-surface">
            The POS at the Heart of Your Ecosystem
          </h2>
          <p className="text-body-md mx-auto mb-4 max-w-2xl text-on-surface-variant">
            SaleChat isn&apos;t just a point of sale; it&apos;s the central hub connecting every
            vital organ of your business operations through our intelligent, modular architecture.
          </p>
          <Callout rotate={8} shiftY={12} className="text-caramel">
            Everything talks to everything.
          </Callout>
        </Reveal>

        <div className="relative mx-auto w-full max-w-6xl">
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
            style={{ minHeight: 360 }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none" aria-hidden>
              <path
                d="M 50% 50% L 20% 20%"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeWidth="2"
                className="text-outline-variant/40"
              />
              <path
                d="M 50% 50% L 80% 20%"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeWidth="2"
                className="text-outline-variant/40"
              />
              <path
                d="M 50% 50% L 20% 80%"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeWidth="2"
                className="text-outline-variant/40"
              />
              <path
                d="M 50% 50% L 80% 80%"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeWidth="2"
                className="text-outline-variant/40"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 md:gap-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
            <div className="order-2 flex w-full flex-col items-center gap-6 sm:gap-8 lg:order-1 lg:items-end">
              {nodes.left.map((node, i) => (
                <Reveal key={node.title} delay={i * 100} className="w-full lg:flex lg:justify-end">
                  <NodeCard {...node} />
                </Reveal>
              ))}
            </div>

            <Reveal
              delay={150}
              className="order-1 flex items-center justify-center py-2 lg:order-2 lg:py-0"
            >
              <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border-[3px] border-primary-container bg-pure-white text-center shadow-[var(--shadow-pos-hub)] animate-hub-pulse sm:h-36 sm:w-36">
                <MaterialIcon name="hub" className="mb-1 text-[36px] text-primary sm:text-[40px]" />
                <h3 className="text-body-md font-bold text-primary sm:text-headline-md">
                  SaleChat POS
                </h3>
                <span className="font-label-caps mt-0.5 tracking-widest text-primary-fixed-dim">
                  THE CORE
                </span>
              </div>
            </Reveal>

            <div className="order-3 flex w-full flex-col items-center gap-6 sm:gap-8 lg:items-start">
              {nodes.right.map((node, i) => (
                <Reveal
                  key={node.title}
                  delay={i * 100 + 50}
                  className="w-full lg:flex lg:justify-start"
                >
                  <NodeCard {...node} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
