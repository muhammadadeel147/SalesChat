import { BRAND } from '@/lib/shared';

type SaleChatLogoProps = {
  variant?: 'full' | 'compact' | 'mark';
  /** dark = sidebar/hero; light = white cards */
  tone?: 'light' | 'dark';
  collapsed?: boolean;
  interactive?: boolean;
  className?: string;
};

/** Text-only brand — no graphic logo. Collapsed / mark = letter "S". */
export function SaleChatLogo({
  variant = 'full',
  tone = 'dark',
  collapsed = false,
  interactive = false,
  className = '',
}: SaleChatLogoProps) {
  const nameClass = tone === 'dark' ? 'text-white' : 'text-brand-900';
  const tagClass = tone === 'dark' ? 'text-brand-200/60' : 'text-brand-600/65';

  if (variant === 'mark' || collapsed) {
    return (
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg font-extrabold text-white ${
          interactive ? 'sidebar-logo-mark' : ''
        } ${className}`}
        aria-label={BRAND.name}
      >
        S
      </span>
    );
  }

  if (variant === 'compact') {
    const rootClass = interactive
      ? `sidebar-logo group/logo flex min-w-0 cursor-default items-center ${className}`
      : `flex min-w-0 items-center ${className}`;

    return (
      <div className={rootClass}>
        <SaleChatWordmark tone={tone} interactive={interactive} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start justify-center gap-1 ${className || ''}`}>
      <p className={`text-[1.75rem] font-extrabold tracking-tight ${nameClass}`}>{BRAND.name}</p>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${tagClass}`}>
        {BRAND.tagline}
      </p>
    </div>
  );
}

export function SaleChatWordmark({
  tone = 'dark',
  interactive = false,
  className = '',
}: {
  tone?: 'light' | 'dark';
  interactive?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p
        className={`truncate text-[16px] font-extrabold leading-[1.25] tracking-tight ${
          tone === 'dark' ? 'text-white' : 'text-brand-900'
        } ${interactive ? 'sidebar-logo-name' : ''}`}
      >
        {BRAND.name}
      </p>
      <p
        className={`mt-1 truncate text-[8px] font-semibold uppercase tracking-[0.16em] ${
          tone === 'dark' ? 'text-brand-200/60' : 'text-brand-600/65'
        } ${interactive ? 'sidebar-logo-tagline' : ''}`}
      >
        {BRAND.tagline}
      </p>
    </div>
  );
}

/** Letter mark for collapsed sidebar */
export function SaleChatMark({
  size = 40,
  className = '',
}: {
  size?: number;
  /** Kept for API compatibility; mark is always brand green. */
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-brand-500 font-extrabold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.48) }}
      aria-label={BRAND.name}
    >
      S
    </span>
  );
}

/** @deprecated Use SaleChatLogo */
export const RaunaqLogo = SaleChatLogo;
/** @deprecated Use SaleChatWordmark */
export const RaunaqWordmark = SaleChatWordmark;
/** @deprecated Use SaleChatMark */
export const RaunaqMark = SaleChatMark;
