import type { CSSProperties } from 'react';

export function MaterialIcon({
  name,
  className = '',
  filled,
  size,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}) {
  const style: CSSProperties | undefined =
    filled || size
      ? {
          ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}),
          ...(size ? { fontSize: size } : {}),
        }
      : undefined;

  return (
    <span className={`material-symbols-outlined ${className}`} style={style} aria-hidden="true">
      {name}
    </span>
  );
}
