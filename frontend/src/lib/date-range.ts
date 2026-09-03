import { useMemo, useState } from 'react';

import { localDateIso, todayIso } from '@/lib/format';

export type DateRangeKey = 'today' | 'week' | 'month' | 'pickMonth' | 'custom';

export const DATE_RANGE_BUTTONS: Array<{ key: DateRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom' },
];

/** Current local calendar month as YYYY-MM */
export function currentMonthKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Inclusive start of the last 7 local calendar days (today and 6 days before). */
export function startOfWeekIso(d = new Date()): string {
  const x = new Date(d);
  x.setDate(x.getDate() - 6);
  return localDateIso(x);
}

export function startOfMonthIso(d = new Date()): string {
  return localDateIso(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonthIso(d = new Date()): string {
  return localDateIso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

/** Inclusive bounds for a YYYY-MM month key. */
export function monthBounds(monthKey: string): { from: string; to: string } {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    const today = todayIso();
    return { from: today, to: today };
  }
  const from = localDateIso(new Date(y, m - 1, 1));
  const to = localDateIso(new Date(y, m, 0));
  return { from, to };
}

export function formatMonthLabel(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return monthKey;
  return new Date(y, m - 1, 1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
}

/** Recent months for the picker (newest first), including the current month. */
export function listSelectableMonths(count = 24, from = new Date()): string[] {
  const months: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  for (let i = 0; i < count; i++) {
    months.push(currentMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return months;
}

export function resolveDateRange(
  range: DateRangeKey,
  customFrom: string,
  customTo: string,
  selectedMonth: string,
): { from: string; to: string } {
  const today = todayIso();
  if (range === 'today') return { from: today, to: today };
  if (range === 'week') return { from: startOfWeekIso(), to: today };
  if (range === 'month') return { from: startOfMonthIso(), to: today };
  if (range === 'pickMonth') return monthBounds(selectedMonth);
  const from = customFrom <= customTo ? customFrom : customTo;
  const to = customFrom <= customTo ? customTo : customFrom;
  return { from, to };
}

export function useDateRangeFilter(defaultRange: DateRangeKey = 'today') {
  const [range, setRange] = useState<DateRangeKey>(defaultRange);
  const [customFrom, setCustomFrom] = useState(todayIso());
  const [customTo, setCustomTo] = useState(todayIso());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());

  const dates = useMemo(
    () => resolveDateRange(range, customFrom, customTo, selectedMonth),
    [range, customFrom, customTo, selectedMonth],
  );

  return {
    range,
    setRange,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    selectedMonth,
    setSelectedMonth,
    dates,
  };
}
