import { usd2 } from '../domain/format';
import type { OrderRow } from '../domain/types';
import { Async, Skeleton, type LoadState } from '../ui/Async';

const MINUS = '−';

function amount(order: OrderRow): { text: string; color: string } {
  const value = usd2(order.total);
  switch (order.status) {
    case 'paid':
    case 'shipped': return { text: `+${value}`, color: 'var(--pos)' };
    case 'pending': return { text: value, color: 'var(--accent)' };
    case 'refunded': return { text: `${MINUS}${value}`, color: 'var(--neg)' };
  }
}

interface Props {
  orders: readonly OrderRow[] | undefined;
  state: LoadState;
  onRetry: () => void;
}

export function LiveOrdersCard({ orders, state, onRetry }: Props) {
  return (
    <div className="b-card b-card-live" data-testid="card-live-orders">
      <div className="b-card-head">
        <h2 className="b-h2">Live orders</h2>
        <span className="b-streaming">streaming</span>
      </div>
      <Async
        state={state}
        onRetry={onRetry}
        skeleton={
          <div className="b-live-list">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="b-live-item" style={i === 4 ? { padding: '12px 0 0', borderBottom: 0 } : undefined}>
                <Skeleton width="55%" height={35} />
                <Skeleton width={64} height={20} />
              </div>
            ))}
          </div>
        }
      >
        <ul className="b-live-list">
          {(orders ?? []).map((o) => {
            const a = amount(o);
            return (
              <li key={o.id} className="b-live-item">
                <div className="b-live-who">
                  <span className="b-live-name">{o.customer}</span>
                  <span className="b-live-meta">{`${o.time} · ${o.id}`}</span>
                </div>
                <span className="b-live-amt" style={{ color: a.color }}>{a.text}</span>
              </li>
            );
          })}
        </ul>
      </Async>
    </div>
  );
}
