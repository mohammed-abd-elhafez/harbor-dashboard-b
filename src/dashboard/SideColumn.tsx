import { Donut } from '../charts/Donut';
import { DONUT_COLORS } from '../domain/chart-math';
import type { InventoryItem, TrafficSource } from '../domain/types';
import { Async, Skeleton, type LoadState } from '../ui/Async';
import { ProgressBar } from '../ui/ProgressBar';

const LEVEL_COLOR: Record<InventoryItem['level'], string> = {
  ok: 'var(--pos)',
  low: 'var(--accent)',
  critical: 'var(--neg)',
};

interface AsyncProps {
  state: LoadState;
  onRetry: () => void;
}

export function TrafficDonutCard({ traffic, state, onRetry }: AsyncProps & { traffic: readonly TrafficSource[] | undefined }) {
  return (
    <div className="b-card b-card-g14" data-testid="card-traffic">
      <h2 className="b-h2">Traffic sources</h2>
      <Async
        state={state}
        onRetry={onRetry}
        skeleton={
          <div className="b-traffic-body">
            <Skeleton width={120} height={120} style={{ borderRadius: 60, flex: 'none' }} />
            <Skeleton width={120} height={90} style={{ flex: '1 1 120px' }} />
          </div>
        }
      >
        <div className="b-traffic-body">
          <Donut traffic={traffic ?? []} />
          <ul className="b-legend">
            {(traffic ?? []).map((t) => (
              <li key={t.id} className="b-legend-item">
                <span className="b-legend-name">
                  <span className="b-swatch" style={{ background: DONUT_COLORS[t.id] }} aria-hidden="true" />
                  {t.label}
                </span>
                <span className="b-mono">{`${t.percent}%`}</span>
              </li>
            ))}
          </ul>
        </div>
      </Async>
    </div>
  );
}

export function InventoryCard({ items, state, onRetry }: AsyncProps & { items: readonly InventoryItem[] | undefined }) {
  return (
    <div className="b-card b-card-g14" data-testid="card-inventory">
      <h2 className="b-h2">Inventory</h2>
      <Async
        state={state}
        onRetry={onRetry}
        skeleton={
          <>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </>
        }
      >
        {(items ?? []).map((item) => {
          const color = LEVEL_COLOR[item.level];
          const value = item.level === 'ok' ? String(item.stock) : `${item.stock} · ${item.level}`;
          return (
            <div key={item.name} className="b-inv-row">
              <div className="b-inv-label">
                <span>{item.name}</span>
                <span className="b-mono" style={item.level === 'ok' ? undefined : { color }}>{value}</span>
              </div>
              <ProgressBar percent={item.fillPercent} color={color} />
            </div>
          );
        })}
      </Async>
    </div>
  );
}
