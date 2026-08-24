import Image from 'next/image';
import { APP_LOGIN_URL, APP_TRIAL_URL } from '@/lib/constants';
import { Reveal } from '../Reveal';
import { Button } from '../Button';
import { MaterialIcon } from '../MaterialIcon';

const pills = [
  { icon: 'point_of_sale', label: 'Cloud POS' },
  { icon: 'inventory_2', label: 'Inventory ERP' },
  { icon: 'restaurant', label: 'Restaurant RMS' },
  { icon: 'hotel', label: 'Hotel HMS' },
] as const;

const mosaicTiles = [
  {
    src: '/hero-pos.png',
    alt: 'Real retail POS terminal with receipt printer on a shop counter',
    label: 'POS',
    priority: true,
  },
  {
    src: '/hero-retail.png',
    alt: 'Retail store counter with tablet POS for billing and stock',
    label: 'Retail',
    priority: false,
  },
  {
    src: '/hero-rms.png',
    alt: 'Restaurant floor and kitchen order management',
    label: 'RMS',
    priority: false,
  },
  {
    src: '/hero-hms.png',
    alt: 'Hotel reception desk with digital check-in',
    label: 'HMS',
    priority: false,
  },
] as const;

export function HeroSection() {
  return (
    <section className="relative isolate w-full overflow-hidden py-3 sm:py-4">
      <div className="site-shell">
        <Reveal>
          <div className="relative mx-auto flex max-h-[calc(100svh-5.5rem)] w-full max-w-[90rem] flex-col overflow-hidden rounded-site bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] px-4 py-4 sm:px-6 sm:py-5 lg:max-h-[calc(100svh-5.75rem)] lg:px-10 lg:py-6">
            <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-primary-container/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 left-8 h-36 w-36 rounded-full bg-on-primary-container/30 blur-3xl" />

            <div className="relative flex min-h-0 flex-1 flex-col gap-3">
              <div className="grid flex-1 items-center gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
                <div className="flex min-w-0 flex-col items-start">
                  <h1 className="mb-3 max-w-2xl -rotate-1 font-caveat text-[clamp(2.6rem,5vw+1rem,4rem)] font-semibold leading-[1.12] text-pure-white">
                    All your business on one{' '}
                    <span className="marker-highlight text-pure-white">platform.</span>
                  </h1>
                  <p className="mb-2 max-w-xl rotate-1 font-caveat text-[clamp(1.85rem,3vw+0.7rem,2.65rem)] font-medium leading-snug text-pure-white">
                    Simple, efficient, yet{' '}
                    <span className="marker-underline text-pure-white">affordable</span>!
                  </p>

                  <div className="mt-6 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:items-center">
                    <Button
                      href={APP_TRIAL_URL}
                      variant="white"
                      size="md"
                      className="group w-full px-6 py-2.5 text-[0.95rem] font-extrabold sm:w-auto"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Start Free Trial
                      <MaterialIcon
                        name="arrow_forward"
                        className="text-[18px] transition-transform group-hover:translate-x-0.5"
                      />
                    </Button>
                    <Button
                      href="/contact"
                      variant="onBrown"
                      size="md"
                      className="w-full px-6 py-2.5 text-[0.95rem] font-extrabold sm:w-auto"
                    >
                      Book a Demo
                    </Button>
                  </div>

                  <a
                    href={APP_LOGIN_URL}
                    className="mt-4 text-body-sm font-semibold text-pure-white/90 transition-colors hover:text-pure-white hover:underline sm:mt-5"
                  >
                    Already have an account? Login
                  </a>
                </div>

                <div className="mx-auto grid w-full max-w-[280px] grid-cols-2 gap-3 sm:max-w-[320px] sm:gap-4 lg:max-w-none lg:gap-5">
                  {mosaicTiles.map((tile, index) => (
                    <div
                      key={tile.label}
                      className={`relative aspect-square overflow-hidden rounded-[1.25rem] shadow-lg sm:rounded-[1.5rem] ${
                        index % 2 === 1 ? 'translate-y-2 sm:translate-y-3' : ''
                      }`}
                    >
                      <div className="absolute inset-[-10%] rotate-[5deg]">
                        <Image
                          src={tile.src}
                          alt={tile.alt}
                          fill
                          className="object-cover"
                          priority={tile.priority}
                          sizes="(max-width: 1024px) 40vw, 18vw"
                        />
                      </div>
                      <span className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-on-primary-container/75 px-2.5 py-0.5 font-label-caps text-pure-white backdrop-blur-sm">
                        {tile.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-full flex-wrap justify-center gap-2 sm:gap-3 lg:-mt-1 lg:justify-start">
                {pills.map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-on-primary-container/30 px-3 py-1.5 font-label-caps text-primary-container"
                  >
                    <MaterialIcon name={pill.icon} className="text-[15px]" />
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
