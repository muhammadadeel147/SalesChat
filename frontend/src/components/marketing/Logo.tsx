import Link from 'next/link';
import { BRAND } from '@/lib/constants';

export function Logo({
  className = '',
  showTagline = false,
  light = false,
}: {
  className?: string;
  showTagline?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex min-w-0 items-center gap-2 ${className}`}
      aria-label={`${BRAND.name} home`}
    >
      <div className="flex min-w-0 flex-col">
        <span
          className={`font-caveat truncate text-[1.15rem] font-semibold leading-none tracking-tight sm:text-[1.25rem] ${
            light ? 'text-pure-white' : 'text-primary'
          }`}
        >
          {BRAND.name}
        </span>
        {showTagline ? (
          <span
            className={`truncate text-[10px] leading-tight sm:text-[11px] ${
              light ? 'text-pure-white/70' : 'text-on-surface-variant'
            }`}
          >
            {BRAND.productBy}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
