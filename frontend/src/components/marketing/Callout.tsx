import type { ReactNode } from 'react';

type CalloutProps = {
  children: ReactNode;
  className?: string;
  rotate?: number;
  shiftY?: number;
};

export function Callout({ children, className = '', rotate = -8, shiftY = -8 }: CalloutProps) {
  return (
    <span
      className={`font-caveat text-callout-accent inline-block origin-center ${className}`}
      style={{ transform: `rotate(${rotate}deg) translateY(${shiftY}px)` }}
    >
      {children}
    </span>
  );
}
