import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary:
    'bg-pure-white text-primary border-2 border-dashed border-primary font-semibold hover:bg-primary hover:text-on-primary transition-all',
  secondary:
    'bg-surface text-primary border-2 border-dashed border-primary font-semibold hover:bg-primary-container transition-all',
  outline:
    'bg-transparent text-primary border-2 border-dashed border-primary font-semibold hover:bg-primary hover:text-on-primary transition-colors',
  ghost:
    'bg-transparent text-on-surface-variant font-semibold hover:text-primary transition-colors',
  dark: 'bg-deep-slate text-pure-white font-semibold hover:bg-on-surface shadow-lg hover:shadow-xl transition-all',
  dashed:
    'bg-pure-white border-2 border-dashed border-primary text-primary font-semibold hover:bg-primary hover:text-on-primary transition-colors',
  solid:
    'bg-primary text-on-primary font-semibold hover:bg-primary/90 hover:shadow-[var(--shadow-card-hover)] transition-all',
  /** White fill + brown text — for CTAs on brown surfaces */
  white:
    'bg-pure-white text-primary font-semibold shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all',
  /** Transparent + white dotted border on brown surfaces; hover fills white, text brown, no border */
  onBrown:
    'bg-transparent text-pure-white border-2 border-dotted border-pure-white font-semibold hover:bg-pure-white hover:text-primary hover:border-transparent transition-all',
} as const;

const sizes = {
  sm: 'px-4 py-1.5 text-body-sm rounded-full',
  md: 'px-5 py-2.5 text-body-sm rounded-full',
  lg: 'px-6 py-3 text-body-md rounded-full',
} as const;

type CommonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = `inline-flex cursor-pointer items-center justify-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`;

  if ('href' in props && props.href) {
    const { href, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
