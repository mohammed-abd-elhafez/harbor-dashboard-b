import type { MouseEvent } from 'react';
import { int, usd2 } from '../domain/format';
import type { OrderRow, Pagination } from '../domain/types';
import { Async, Skeleton, type LoadState } from '../ui/Async';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

const COLUMNS: { label: string; right?: boolean }[] = [
  { label: 'Order' },
  { label: 'Customer' },
  { label: 'Item' },
  { label: 'Total', right: true },
  { label: 'Status' },
];

interface Props {
  orders: readonly OrderRow[] | undefined;
  pagination: Pagination | undefined;
  state: LoadState;
  onRetry: () => void;
}

export function OrderLogCard({ orders, pagination, state, onRetry }: Props) {
  const ready = state === 'ready' && orders && pagination;
  const empty = ready && orders.length === 0;
  const { shown, total, page, pages } = empty || !pagination ? { shown: 0, total: 0, page: 1, pages: 1 } : pagination;
  return (
    <div className="b-card b-card-orders" data-testid="card-orders">
      <div className="b-card-head">
        <h2 className="b-h2">Order log</h2>
        <a href="#" className="b-link" onClick={(e: MouseEvent) => e.preventDefault()}>
          Open all orders <Icon name="arrow-right" size={16} />
        </a>
      </div>
      <Async
        state={state}
        onRetry={onRetry}
        skeleton={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} height={46 - 8} style={{ margin: '4px 0' }} />
            ))}
          </div>
        }
      >
        {empty ? (
          <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: 'var(--text-muted)' }}>
            No orders in this period
          </div>
        ) : (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll the table (axe scrollable-region-focusable)
          <div className="b-table-wrap" role="region" aria-label="Order log table" tabIndex={0}>
            <table className="b-table" data-testid="orders-table">
              <caption className="sr-only">Order log</caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c.label} scope="col" className={`b-th${c.right ? ' b-right' : ''}`}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).map((o) => (
                  <tr key={o.id}>
                    <td className="b-td b-mono">{o.id}</td>
                    <td className="b-td">{o.customer}</td>
                    <td className="b-td b-muted">{o.item}</td>
                    <td className="b-td b-right b-mono">{usd2(o.total)}</td>
                    <td className="b-td"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ready && !empty && <p className="b-scroll-hint">Scroll sideways to see all columns</p>}
      </Async>
      <div className="b-foot">
        <span className="b-mono13 b-muted">
          {state === 'ready' ? `${shown} of ${int(total)} orders · page ${page} / ${pages}` : ' '}
        </span>
        <div className="b-foot-btns">
          <Button disabled={state !== 'ready' || page <= 1}>Prev</Button>
          <Button disabled={state !== 'ready' || !!empty}>Next</Button>
        </div>
      </div>
    </div>
  );
}
