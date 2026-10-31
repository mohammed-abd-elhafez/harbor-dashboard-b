import type { RangeKey } from './types';

export const RANGES: readonly RangeKey[] = ['24h', '7d', '30d', '90d'];
export const DEFAULT_RANGE: RangeKey = '30d';

/** Spec 4.5: invalid or missing values fall back to the default, silently. */
export function parseRange(search: string): RangeKey {
  const raw = new URLSearchParams(search).get('range');
  return RANGES.find((r) => r === raw) ?? DEFAULT_RANGE;
}
