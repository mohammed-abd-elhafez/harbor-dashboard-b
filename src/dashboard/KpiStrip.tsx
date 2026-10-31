import { int, pct2, signedPct1, signedPt1, usd0, usd2 } from '../domain/format';
import type { Kpi } from '../domain/types';
import { Async, Skeleton, type LoadState } from '../ui/Async';
import { Icon } from '../ui/Icon';

const PLACEHOLDER_LABELS = ['Revenue', 'Orders', 'Conversion', 'Avg. order'];

function formatValue(kpi: Kpi): string {
  switch (kpi.id) {
    case 'revenue': return usd0(kpi.value);
    case 'orders': return int(kpi.value);
    case 'conversion': return pct2(kpi.value);
    case 'avgOrder': return usd2(kpi.value);
  }
}

function formatDelta(kpi: Kpi): string {
  const { value, unit, direction } = kpi.delta;
  return unit === 'pt' ? signedPt1(value, direction) : signedPct1(value, direction);
}

interface Props {
  kpis: readonly Kpi[] | undefined;
  comparedShort: string;
  state: LoadState;
  onRetry: () => void;
}

export function KpiStrip({ kpis, comparedShort, state, onRetry }: Props) {
  const ready = state === 'ready' && kpis;
  return (
    <section aria-label="Key metrics" className="b-kpis" data-testid="kpi-strip">
      {ready
        ? kpis.map((kpi, i) => {
            const up = kpi.delta.direction === 'up';
            return (
              <div key={kpi.id} className="b-kpi" data-testid={`kpi-${i}`}>
                <span className="b-kpi-label">{kpi.label}</span>
                <span className="b-kpi-value">{formatValue(kpi)}</span>
                <span className={`b-delta ${up ? 'b-delta-up' : 'b-delta-down'}`}>
                  <Icon name={up ? 'arrow-up-right' : 'arrow-down-right'} size={14} strokeWidth={2.4} />
                  {formatDelta(kpi)}
                  <span className="b-muted">{`vs ${comparedShort}`}</span>
                </span>
              </div>
            );
          })
        : PLACEHOLDER_LABELS.map((label, i) => (
            <div key={label} className="b-kpi" data-testid={`kpi-${i}`}>
              <span className="b-kpi-label">{label}</span>
              <Async
                state={state}
                onRetry={onRetry}
                skeleton={
                  <>
                    <Skeleton width={120} height={32} style={{ margin: '6px 0' }} />
                    <Skeleton width={90} height={17} />
                  </>
                }
              >
                {null}
              </Async>
            </div>
          ))}
    </section>
  );
}
