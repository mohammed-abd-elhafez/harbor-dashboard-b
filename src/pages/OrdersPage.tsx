import { useState } from 'react';
import { useOrdersList } from '../data/queries';
import { usd2 } from '../domain/format';
import type { OrderRow, OrderStatus, RangeKey } from '../domain/types';
import { Async, type LoadState } from '../ui/Async';
import { StatusBadge } from '../ui/Badge';
import { DataTable, type Column } from '../ui/DataTable';
import { Pager } from '../ui/Pager';
import { RangeGroup } from '../ui/RangeGroup';
import { PageTitle, TableSkeleton } from './PageTitle';

const FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Refunded', value: 'refunded' },
];

const COLUMNS: Column<OrderRow>[] = [
  { label: 'Order', mono: true, cell: (o) => o.id },
  { label: 'Date', muted: true, cell: (o) => `${o.date ?? ''} ${o.time}`.trim() },
  { label: 'Customer', cell: (o) => o.customer },
  { label: 'Item', muted: true, cell: (o) => o.item },
  { label: 'Total', right: true, mono: true, cell: (o) => usd2(o.total) },
  { label: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
];

interface Props {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  enabled: boolean;
}

export function OrdersPage({ range, onRangeChange, enabled }: Props) {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(1);
  const { data, isError, refetch } = useOrdersList(range, page, status, enabled);
  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';
  const empty = state === 'ready' && data?.items.length === 0;

  return (
    <>
      <PageTitle slug="orders" title="Orders">
        <RangeGroup
          range={range}
          onRangeChange={(r) => {
            setPage(1);
            onRangeChange(r);
          }}
        />
      </PageTitle>
      <section className="b-card b-card-g14" aria-label="Order list">
        <div role="group" aria-label="Filter by status" className="b-range b-range-wide">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className="b-range-btn"
              aria-pressed={f.value === status}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Async state={state} onRetry={() => void refetch()} skeleton={<TableSkeleton rows={10} />}>
          {empty ? (
            <p className="b-empty">No orders match this filter</p>
          ) : (
            <DataTable caption="Orders" columns={COLUMNS} rows={data?.items ?? []} rowKey={(o) => o.id} testId="orders-page-table" />
          )}
        </Async>
        <Pager pagination={state === 'ready' ? data?.pagination : undefined} noun="orders" onPageChange={setPage} />
      </section>
    </>
  );
}
