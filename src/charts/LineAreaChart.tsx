import { useState, type PointerEvent } from 'react';
import { chartAriaLabel, computePoints, samplePoints, toAreaPath, toPolyline } from '../domain/chart-math';
import { axisK, tooltipK } from '../domain/format';
import type { SeriesPoint } from '../domain/types';

const Y_LABELS = [
  { value: 0, y: 204 },
  { value: 1000, y: 132 },
  { value: 2000, y: 60 },
];
const GRID_Y = [200, 128, 56];
const X_LABELS_5 = { indexes: [0, 4, 8, 12, 15], anchors: ['start', 'middle', 'middle', 'middle', 'end'] } as const;
const X_LABELS_3 = { indexes: [0, 8, 15], anchors: ['start', 'middle', 'end'] } as const;
const RIGHT_MARGIN = 16;
const MONO = 'IBM Plex Mono, monospace';

/**
 * Without `width`: fixed 680-unit viewBox that scales with its container, so labels grow to ~13.6px at 1440.
 * That is intentional for pixel parity (spec 3.4 / 7.3).
 * With `width` (below 1280, spec 12): viewBox equals the measured width, so labels stay a native 12px.
 */
export function LineAreaChart({ series, width }: { series: readonly SeriesPoint[]; width?: number }) {
  const points = samplePoints(series);
  const vbWidth = width ?? 680;
  const x1 = vbWidth - RIGHT_MARGIN;
  const xy = computePoints(points, undefined, x1);
  const xLabels = width !== undefined && width < 520 ? X_LABELS_3 : X_LABELS_5;
  const [hover, setHover] = useState<number | null>(null);
  const last = xy[xy.length - 1];
  const lastPoint = points[points.length - 1];
  if (!last || !lastPoint) return null;

  // At rest the marker sits on the latest point (pixel-parity state); pointing at the chart moves it.
  const activeIdx = hover ?? xy.length - 1;
  const active = xy[activeIdx] ?? last;
  const activePoint = points[activeIdx] ?? lastPoint;
  const resting = activeIdx === xy.length - 1;
  const tipX = resting ? active.x - 116 : Math.min(Math.max(active.x - 50, 52), x1 - 100);

  const pointTo = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    const vx = ((e.clientX - box.left) / box.width) * vbWidth;
    let best = 0;
    xy.forEach((p, i) => {
      if (Math.abs(p.x - vx) < Math.abs((xy[best]?.x ?? 0) - vx)) best = i;
    });
    setHover(best);
  };

  return (
    <svg
      data-testid="revenue-chart-svg"
      viewBox={`0 0 ${vbWidth} 250`}
      width={width ?? '100%'}
      role="img"
      aria-label={chartAriaLabel(points)}
      style={{ display: 'block', height: 'auto', touchAction: 'pan-y' }}
      onPointerMove={pointTo}
      onPointerDown={pointTo}
      onPointerLeave={() => setHover(null)}
      onPointerCancel={() => setHover(null)}
    >
      <g stroke="#1E2A36" strokeWidth="1" strokeDasharray="3 5">
        {GRID_Y.map((y) => (
          <line key={y} x1="48" y1={y} x2={x1} y2={y} />
        ))}
      </g>
      <g fontFamily={MONO} fontSize="12" fill="#93A1B0" textAnchor="end">
        {Y_LABELS.map((l) => (
          <text key={l.y} x="40" y={l.y}>
            {axisK(l.value)}
          </text>
        ))}
      </g>
      <path d={toAreaPath(xy)} fill="#F5B544" fillOpacity="0.12" />
      <polyline points={toPolyline(xy)} fill="none" stroke="#F5B544" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {!resting && (
        <line x1={active.x} y1="30" x2={active.x} y2="200" stroke="#2B3A4A" strokeWidth="1" data-testid="chart-guide" />
      )}
      <circle cx={active.x} cy={active.y} r="5" fill="#0B0F14" stroke="#F5B544" strokeWidth="2.5" data-testid="chart-marker" />
      <rect x={tipX} y="2" width="100" height="24" rx="4" fill="#1B2531" stroke="#2B3A4A" />
      <text x={tipX + 50} y="18" textAnchor="middle" fontFamily={MONO} fontSize="12" fill="#E6EDF3" data-testid="chart-tooltip">
        {`${activePoint.label} · ${tooltipK(activePoint.value)}`}
      </text>
      <g fontFamily={MONO} fontSize="12" fill="#93A1B0">
        {xLabels.indexes.map((idx, n) => {
          const p = xy[idx];
          const src = points[idx];
          if (!p || !src) return null;
          const anchor = xLabels.anchors[n]!;
          return (
            <text key={idx} x={p.x} y="226" textAnchor={anchor === 'start' ? undefined : anchor}>
              {src.label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
