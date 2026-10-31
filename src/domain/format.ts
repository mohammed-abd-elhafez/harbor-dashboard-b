import type { DeltaDirection } from './types';

const MINUS = '−';
const usd0Fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2Fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const intFmt = new Intl.NumberFormat('en-US');

export const usd0 = (n: number): string => usd0Fmt.format(n);
export const usd2 = (n: number): string => usd2Fmt.format(n);
export const int = (n: number): string => intFmt.format(n);
export const pct2 = (n: number): string => `${n.toFixed(2)}%`;

const sign = (dir: DeltaDirection): string => (dir === 'up' ? '+' : MINUS);
export const signedPct1 = (n: number, dir: DeltaDirection): string => `${sign(dir)}${n.toFixed(1)}%`;
export const signedPt1 = (n: number, dir: DeltaDirection): string => `${sign(dir)}${n.toFixed(1)} pt`;

export const axisK = (n: number): string => (n === 0 ? '$0' : `$${n / 1000}k`);
export const tooltipK = (n: number): string => `$${(n / 1000).toFixed(1)}k`;
