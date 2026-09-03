'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  currentMonthKey,
  formatMonthLabel,
  listSelectableMonths,
  type DateRangeKey,
} from '@/lib/date-range';

type Props = {
  range: DateRangeKey;
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  onRangeChange: (range: DateRangeKey) => void;
  /** Compact trigger for page headers */
  variant?: 'inline' | 'header';
  className?: string;
};

export function MonthSelectDropdown({
  range,
  selectedMonth,
  onSelectMonth,
  onRangeChange,
  variant = 'inline',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const months = listSelectableMonths(24);
  const isActive = range === 'pickMonth';
  const label = formatMonthLabel(selectedMonth);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const pick = (monthKey: string) => {
    onSelectMonth(monthKey);
    onRangeChange('pickMonth');
    setOpen(false);
  };

  const triggerClass =
    variant === 'header'
      ? `inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
          isActive
            ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-sm'
            : 'border-border bg-white text-text hover:bg-surface-muted'
        }`
      : `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-text-muted hover:bg-surface-muted hover:text-text'
        }`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        <span>{isActive ? label : 'By month'}</span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label="Select month"
          className={`absolute z-50 max-h-72 w-56 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-lg animate-dropdown-in ${
            variant === 'header' ? 'right-0 top-[calc(100%+6px)]' : 'left-0 top-[calc(100%+6px)]'
          }`}
        >
          {months.map((monthKey) => {
            const selected = isActive && monthKey === selectedMonth;
            const isCurrent = monthKey === currentMonthKey();
            return (
              <button
                key={monthKey}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => pick(monthKey)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted ${
                  selected ? 'bg-brand-50 font-semibold text-brand-800' : 'text-text'
                }`}
              >
                <span>{formatMonthLabel(monthKey)}</span>
                {isCurrent ? (
                  <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                    Now
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
