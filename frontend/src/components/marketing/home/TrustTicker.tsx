const items = [
  'Reliable',
  'Scalable',
  'Integrated',
  'Lightning Fast',
  'Secure Data',
  'Cloud POS',
  'Real-time Sync',
  'Multi-branch',
] as const;

export function TrustTicker() {
  // Two identical halves so translateX(-50%) loops forever without a jump
  const half = [...items, ...items];
  const loop = [...half, ...half];

  return (
    <div className="relative z-10 w-full overflow-hidden border-y border-surface-variant/20 bg-surface-container-high py-3 shadow-inner sm:py-4">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-gradient-to-r from-surface-container-high to-transparent sm:w-16" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-surface-container-high to-transparent sm:w-16" />
      <div className="animate-ticker flex w-max whitespace-nowrap will-change-transform">
        {loop.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="text-hollow-brown inline-flex items-center px-5 text-[0.95rem] font-bold uppercase tracking-[0.18em] sm:px-8 sm:text-[1.05rem]"
          >
            {label}
            <span className="mx-5 inline-block select-none text-primary/35 sm:mx-7" aria-hidden>
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
