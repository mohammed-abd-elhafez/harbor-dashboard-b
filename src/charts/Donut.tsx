import { buildDonutSegments } from '../domain/chart-math';
import type { TrafficSource } from '../domain/types';

export function Donut({ traffic }: { traffic: readonly TrafficSource[] }) {
  const segments = buildDonutSegments(traffic);
  const label = `Donut chart: ${traffic.map((t) => `${t.label} ${t.percent} percent`).join(', ')}`;
  return (
    <svg
      data-testid="donut-svg"
      className="b-donut"
      width="120"
      height="120"
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
    >
      <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2A36" strokeWidth="14" />
      {segments.map((s) => (
        <circle
          key={s.id}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={`${s.len} 251.3`}
          strokeDashoffset={s.offset}
          transform="rotate(-90 50 50)"
        />
      ))}
    </svg>
  );
}
