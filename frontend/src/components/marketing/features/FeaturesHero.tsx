'use client';

import { useEffect, useRef, useState } from 'react';
import { Callout } from '../Callout';
import { Reveal } from '../Reveal';
import { MaterialIcon } from '../MaterialIcon';

const waveSteps = [
  {
    label: 'Sell at the counter',
    blurb: 'Fast POS checkout',
    rotate: -8,
    side: 'left' as const,
  },
  {
    label: 'Sync in real time',
    blurb: 'Stock, rooms & kitchen',
    rotate: 4,
    side: 'center' as const,
  },
  {
    label: 'Grow every branch',
    blurb: 'One cloud backbone',
    rotate: -6,
    side: 'right' as const,
  },
];

const SEGMENT_MS = 1600;
const PAUSE_MS = 320;
const DOT = 8;
const NODE_POINTS = [
  { x: 50, y: 100, r: 6 },
  { x: 500, y: 100, r: 9 },
  { x: 950, y: 100, r: 6 },
] as const;

const SEGMENTS = [
  'M50 100 C 200 100, 300 20, 500 100',
  'M500 100 C 700 180, 800 100, 950 100',
] as const;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function FeaturesHero() {
  return (
    <section className="section-y relative w-full overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-caramel/10 via-surface to-surface" />
      <div className="site-shell relative">
        <div className="mb-10 grid grid-cols-1 items-start gap-8 lg:mb-14 lg:grid-cols-2 lg:gap-12">
          <Reveal className="flex flex-col gap-3 sm:gap-4 lg:-mt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-px w-6 border-t-2 border-dashed border-primary sm:w-8" />
              <span className="font-label-caps tracking-widest text-caramel">
                Platform Capabilities
              </span>
            </div>
            <h1 className="text-headline-xl text-on-surface">
              One Ecosystem. <br />
              <span className="text-on-surface-variant">Infinite Potential.</span>
            </h1>
            <p className="text-body-md max-w-xl text-on-surface-variant">
              SaleChat unifies your operational verticals into a single, cohesive engine. From point
              of sale to enterprise resource planning, orchestrate growth with precision.
            </p>
            <Callout rotate={-9} shiftY={-10} className="text-caramel">
              Built to work together.
            </Callout>
          </Reveal>

          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-caramel/10 blur-3xl sm:-inset-8" />
            <Reveal className="group relative z-10 flex flex-col gap-3 rounded-xl border-2 border-dashed border-primary/35 bg-pure-white p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 sm:rounded-2xl sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container transition-colors group-hover:bg-primary-container sm:h-11 sm:w-11 sm:rounded-xl">
                <MaterialIcon
                  name="code"
                  className="text-caramel transition-colors group-hover:text-on-primary-container"
                />
              </div>
              <h3 className="text-headline-md text-on-surface">Custom Built</h3>
              <p className="text-body-sm text-on-surface-variant">
                Tailored architecture ensuring the platform bends to your workflows.
              </p>
            </Reveal>
            <Reveal
              delay={100}
              className="group relative z-10 flex flex-col gap-3 rounded-xl border-2 border-dashed border-primary/35 bg-pure-white p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 sm:mt-6 sm:rounded-2xl sm:p-6 lg:mt-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container transition-colors group-hover:bg-primary-container sm:h-11 sm:w-11 sm:rounded-xl">
                <MaterialIcon
                  name="cloud"
                  className="text-caramel transition-colors group-hover:text-on-primary-container"
                />
              </div>
              <h3 className="text-headline-md text-on-surface">Cloud Native</h3>
              <p className="text-body-sm text-on-surface-variant">
                High availability, real-time sync, and robust security.
              </p>
            </Reveal>
          </div>
        </div>

        <EcosystemWave />
      </div>
    </section>
  );
}

function EcosystemWave() {
  const rootRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const maskRefs = useRef<(SVGPathElement | null)[]>([]);
  const travelerRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef(0);
  const [active, setActive] = useState(-1);
  const [traveling, setTraveling] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    const timers: number[] = [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(() => resolve(), ms));
      });

    const resetMask = (mask: SVGPathElement, length: number) => {
      mask.setAttribute('stroke-dasharray', `0 ${length}`);
    };

    /** Dot travels the path; dotted line is revealed behind it via mask */
    const travelSegment = (path: SVGPathElement, mask: SVGPathElement) =>
      new Promise<void>((resolve) => {
        const traveler = travelerRef.current;
        if (!traveler) {
          resolve();
          return;
        }

        const length = path.getTotalLength();
        resetMask(mask, length);
        setTraveling(true);

        const startPt = path.getPointAtLength(0);
        traveler.setAttribute('cx', String(startPt.x));
        traveler.setAttribute('cy', String(startPt.y));

        const start = performance.now();

        const frame = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }

          const t = Math.min(1, (now - start) / SEGMENT_MS);
          const eased = easeInOut(t);
          const dist = eased * length;
          const pt = path.getPointAtLength(dist);

          // Reveal dotted trail behind the traveler
          mask.setAttribute('stroke-dasharray', `${dist} ${length}`);
          traveler.setAttribute('cx', String(pt.x));
          traveler.setAttribute('cy', String(pt.y));

          if (t < 1) {
            rafRef.current = requestAnimationFrame(frame);
          } else {
            mask.setAttribute('stroke-dasharray', `${length} ${length}`);
            resolve();
          }
        };

        rafRef.current = requestAnimationFrame(frame);
      });

    const run = async () => {
      const segs = segRefs.current.filter(Boolean) as SVGPathElement[];
      const masks = maskRefs.current.filter(Boolean) as SVGPathElement[];
      const traveler = travelerRef.current;
      if (!segs.length || !masks.length || !traveler) return;

      if (reduced) {
        masks.forEach((mask, i) => {
          const len = segs[i]?.getTotalLength() ?? 1000;
          mask.setAttribute('stroke-dasharray', `${len} ${len}`);
        });
        setActive(2);
        setTraveling(false);
        setStarted(true);
        return;
      }

      masks.forEach((mask, i) => resetMask(mask, segs[i].getTotalLength()));
      setStarted(true);

      setActive(0);
      traveler.setAttribute('cx', String(NODE_POINTS[0].x));
      traveler.setAttribute('cy', String(NODE_POINTS[0].y));
      setTraveling(true);
      await wait(PAUSE_MS);

      await travelSegment(segs[0], masks[0]);
      setActive(1);
      setTraveling(false);
      await wait(PAUSE_MS);

      setTraveling(true);
      await travelSegment(segs[1], masks[1]);
      setActive(2);
      setTraveling(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void run();
      },
      { threshold: 0.4 },
    );

    observer.observe(root);
    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mb-6 w-full sm:mb-8">
      <div className="relative mx-auto w-full max-w-3xl px-1 pb-14 sm:pb-16 lg:max-w-4xl">
        <svg
          className="h-auto w-full text-caramel/70"
          fill="none"
          viewBox="0 0 1000 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            {SEGMENTS.map((d, i) => (
              <mask key={`mask-${i}`} id={`wave-reveal-${i}`} maskUnits="userSpaceOnUse">
                <rect width="1000" height="200" fill="black" />
                <path
                  ref={(el) => {
                    maskRefs.current[i] = el;
                  }}
                  d={d}
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="0 2000"
                />
              </mask>
            ))}
          </defs>

          {SEGMENTS.map((d, i) => (
            <path
              key={d}
              ref={(el) => {
                segRefs.current[i] = el;
              }}
              d={d}
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
              strokeDasharray={`${DOT} ${DOT}`}
              mask={`url(#wave-reveal-${i})`}
            />
          ))}

          {NODE_POINTS.map((node, i) => (
            <circle
              key={`${node.x}-${node.y}`}
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="#059669"
              className={`origin-center transition-all duration-300 ease-out ${
                active >= i ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          ))}

          <circle
            ref={travelerRef}
            cx={NODE_POINTS[0].x}
            cy={NODE_POINTS[0].y}
            r={7}
            fill="#059669"
            stroke="#d1faf0"
            strokeWidth="2"
            className={`transition-opacity duration-200 ${traveling ? 'opacity-100' : 'opacity-0'}`}
          />
        </svg>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[48%]">
          {waveSteps.map((step, index) => {
            const shown = active >= index;
            const pos =
              step.side === 'left'
                ? 'left-0'
                : step.side === 'right'
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2';
            return (
              <div
                key={step.label}
                className={`absolute top-0 max-w-[9.5rem] text-center sm:max-w-[11rem] ${pos}`}
              >
                <div
                  className={`transition-all duration-300 ease-out ${
                    shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  }`}
                >
                  <p
                    className="font-caveat text-[1.05rem] font-semibold leading-tight text-caramel sm:text-[1.25rem]"
                    style={{ transform: `rotate(${step.rotate}deg)` }}
                  >
                    {step.label}
                  </p>
                  <p
                    className="mt-0.5 font-caveat text-[0.85rem] leading-snug text-on-surface-variant sm:text-[0.95rem]"
                    style={{ transform: `rotate(${step.rotate}deg)` }}
                  >
                    {step.blurb}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!started ? <span className="sr-only">Workflow animation loads on scroll</span> : null}
      </div>
    </div>
  );
}
