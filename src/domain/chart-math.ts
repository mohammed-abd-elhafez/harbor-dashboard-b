import type { SeriesPoint, TrafficSource } from './types';

// Spec 7.2 geometry, in viewBox units.
export const PLOT = { x0: 48, x1: 664, baseline: 200, pxPerUnit: 72, unit: 1000, count: 16 } as const;
const STEP = (PLOT.x1 - PLOT.x0) / (PLOT.count - 1);

/**
 * Explicit x positions for the 16-point chart. The spec text says Math.round(48 + i * 41.0667),
 * but its own expected list (and the reference HTML) differ from that formula at i = 8..13.
 * The reference wins (spec rule 0.1), so the 16-point case uses the list verbatim.
 * See DERIVED_DECISIONS.md.
 */
const X_16 = [48, 89, 130, 171, 212, 253, 294, 335, 376, 417, 458, 499, 540, 581, 623, 664] as const;

export interface XY {
  x: number;
  y: number;
}

/** `x1` is the right edge of the plot; 664 is the reference value (viewBox 680). */
export function computePoints(points: readonly SeriesPoint[], unit: number = PLOT.unit, x1: number = PLOT.x1): XY[] {
  const exact = points.length === PLOT.count && x1 === PLOT.x1;
  const step = (x1 - PLOT.x0) / Math.max(points.length - 1, 1);
  return points.map((p, i) => ({
    x: exact ? X_16[i]! : Math.round(PLOT.x0 + i * step),
    y: Math.round(PLOT.baseline - (p.value / unit) * PLOT.pxPerUnit),
  }));
}

/** Q2 default: any length is sampled evenly down to 16 points. */
export function samplePoints(points: readonly SeriesPoint[], count: number = PLOT.count): SeriesPoint[] {
  if (points.length <= count) return [...points];
  return Array.from({ length: count }, (_, i) => points[Math.round((i * (points.length - 1)) / (count - 1))]!);
}

export const toPolyline = (xy: readonly XY[]): string => xy.map((p) => `${p.x},${p.y}`).join(' ');

export function toAreaPath(xy: readonly XY[]): string {
  const last = xy[xy.length - 1];
  if (!last) return '';
  const body = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return `${body} L${last.x},${PLOT.baseline} L${PLOT.x0},${PLOT.baseline} Z`;
}

export function chartAriaLabel(points: readonly SeriesPoint[]): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return 'Line chart of daily revenue';
  const k = (n: number) => (n / 1000).toFixed(1);
  return `Line chart of daily revenue from ${first.label} to ${last.label}, rising from about ${k(first.value)} thousand dollars to ${k(last.value)} thousand dollars`;
}

export interface DonutSegment {
  id: TrafficSource['id'];
  len: number;
  offset: number;
  color: string;
}
const CIRCUMFERENCE = 251.3;
export const DONUT_COLORS: Record<TrafficSource['id'], string> = {
  search: '#F5B544',
  direct: '#6CB6FF',
  social: '#3DD68C',
  email: '#93A1B0',
};

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function buildDonutSegments(traffic: readonly TrafficSource[]): DonutSegment[] {
  let cumulative = 0;
  return traffic.map((t) => {
    const len = round1((t.percent / 100) * CIRCUMFERENCE);
    const seg: DonutSegment = { id: t.id, len, offset: cumulative === 0 ? 0 : -cumulative, color: DONUT_COLORS[t.id] };
    cumulative = round1(cumulative + len);
    return seg;
  });
}

// STEP is kept for non-16 series documentation parity.
export const X_STEP = STEP;
