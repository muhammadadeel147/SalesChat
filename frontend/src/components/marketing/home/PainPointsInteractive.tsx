'use client';

import { useState } from 'react';
import { Callout } from '../Callout';
import { Reveal } from '../Reveal';
import { MaterialIcon } from '../MaterialIcon';

const painCards = [
  {
    icon: 'broken_image',
    title: 'Fragmented Interfaces',
    description:
      'Legacy systems with 90s-era menus. Your staff spends more time fighting the software than serving customers.',
    callout: '"Where is the refund button?"',
    rotate: -11,
    shiftY: -14,
  },
  {
    icon: 'cloud_off',
    title: 'Data Silos & Blind Spots',
    description:
      "Inventory doesn't talk to POS. Sales reports don't match bank deposits. Decisions based on guesswork.",
    callout: '"The numbers don\'t add up..."',
    rotate: 9,
    shiftY: 16,
  },
  {
    icon: 'hourglass_empty',
    title: 'Manual Reconciliation',
    description:
      'Managers staying late to manually sync RMS and HMS data. A single typo can trigger hours of accounting.',
    callout: '"Another late night..."',
    rotate: -7,
    shiftY: 10,
  },
] as const;

const solutionCards = [
  {
    icon: 'auto_awesome',
    title: 'Intuitive Design',
    description: 'Zero training required. A touch-friendly UI that teams love from day one.',
    callout: '"So easy to use!"',
    rotate: 8,
    shiftY: -12,
  },
  {
    icon: 'sync',
    title: 'Real-time Sync',
    description: 'Every transaction instantly updates inventory, RMS, HMS, and accounting.',
    callout: '"Always accurate."',
    rotate: -10,
    shiftY: 14,
  },
  {
    icon: 'bolt',
    title: 'Automated Workflows',
    description: 'End-of-day happens in seconds, not hours. Let the system do the heavy lifting.',
    callout: '"Time saved!"',
    rotate: 6,
    shiftY: -8,
  },
] as const;

export function PainPointsInteractive() {
  const [transformed, setTransformed] = useState(false);
  const cards = transformed ? solutionCards : painCards;

  return (
    <section id="old-way" className="section-y relative isolate z-10 w-full overflow-hidden">
      <div className="site-shell">
        <div
          className={`relative overflow-hidden rounded-site px-5 py-8 transition-colors duration-500 sm:px-8 sm:py-10 lg:px-12 lg:py-12 ${
            transformed ? 'bg-pure-white shadow-[var(--shadow-card)]' : 'bg-inverse-on-surface'
          }`}
        >
          <div className="pointer-events-none absolute left-6 top-8 hidden lg:block">
            <Callout
              rotate={-18}
              shiftY={-6}
              className={transformed ? 'text-primary' : 'text-caramel/70'}
            >
              {transformed ? 'clarity restored' : 'the old way'}
            </Callout>
          </div>
          <div className="pointer-events-none absolute right-10 top-16 hidden md:block">
            <Callout
              rotate={14}
              shiftY={18}
              className={transformed ? 'text-secondary' : 'text-outline'}
            >
              {transformed ? 'one backbone' : 'still guessing?'}
            </Callout>
          </div>
          <div className="pointer-events-none absolute bottom-24 left-1/3 hidden lg:block">
            <Callout
              rotate={-8}
              shiftY={12}
              className={transformed ? 'text-caramel' : 'text-on-surface-variant/70'}
            >
              {transformed ? "that's better" : 'late nights'}
            </Callout>
          </div>

          <Reveal className="relative mb-10 min-h-[7.5rem] text-center sm:mb-12 sm:min-h-[8rem]">
            <h2
              className={`text-headline-lg mb-3 transition-colors duration-500 ${
                transformed ? 'text-primary' : 'text-on-surface'
              }`}
            >
              {transformed ? 'Clarity Restored.' : 'The Old Way is Broken'}
            </h2>
            <p className="text-body-md mx-auto mb-4 max-w-xl text-on-surface-variant">
              {transformed
                ? 'One seamless platform for every operational need. The ecosystem works in harmony.'
                : 'Disjointed systems create friction that slows your growth. Experience the shift with SaleChat.'}
            </p>
            <Callout
              rotate={transformed ? 7 : -6}
              shiftY={transformed ? 10 : -10}
              className="text-callout-xl text-caramel"
            >
              {transformed ? 'The new way actually works.' : 'Spreadsheets are not a strategy.'}
            </Callout>
          </Reveal>

          <div className="relative mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`flex h-full min-h-[16.5rem] flex-col rounded-site border-2 border-dashed p-5 transition-all duration-500 sm:min-h-[17.5rem] sm:p-6 ${
                  transformed
                    ? 'border-primary bg-surface-container-low'
                    : 'border-primary/35 bg-surface-dim/30'
                }`}
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 ${
                    transformed
                      ? 'bg-primary-container/50 text-primary'
                      : 'border-2 border-dashed border-primary/30 bg-surface-container-highest text-outline'
                  }`}
                >
                  <MaterialIcon name={card.icon} className="text-[20px]" />
                </div>
                <h3 className="text-headline-md mb-2 text-on-surface">{card.title}</h3>
                <p className="text-body-sm flex-1 text-on-surface-variant">{card.description}</p>
                <Callout
                  rotate={card.rotate}
                  shiftY={card.shiftY}
                  className={`mt-5 transition-colors duration-500 ${
                    transformed ? 'text-primary' : 'text-caramel'
                  }`}
                >
                  {card.callout}
                </Callout>
              </div>
            ))}
          </div>

          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={() => setTransformed((v) => !v)}
              className={`group relative flex items-center gap-2 overflow-hidden rounded-full border-2 px-6 py-3 text-body-md font-semibold transition-all sm:px-8 sm:py-3.5 ${
                transformed
                  ? 'border-dashed border-primary bg-pure-white text-primary hover:bg-primary hover:text-on-primary'
                  : 'border-transparent bg-primary text-on-primary shadow-lg hover:bg-[#a75a28] hover:shadow-xl'
              }`}
            >
              {!transformed ? (
                <span className="absolute inset-0 w-full -translate-x-full bg-gradient-to-r from-transparent via-pure-white/25 to-transparent group-hover:animate-shimmer" />
              ) : null}
              {transformed ? 'Reset View' : 'Imagine with SaleChat'}
              <MaterialIcon
                name={transformed ? 'refresh' : 'auto_awesome'}
                className={
                  transformed
                    ? ''
                    : 'transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110'
                }
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
