import { useState } from 'react';
import { useCustomers } from '../data/queries';
import { int, usd2 } from '../domain/format';
import type { CustomerRow } from '../domain/types';
import { Async, type LoadState } from '../ui/Async';
import { DataTable, type Column } from '../ui/DataTable';
import { Pager } from '../ui/Pager';
import { PageTitle, TableSkeleton } from './PageTitle';

const COLUMNS: Column<CustomerRow>[] = [
  {
    label: 'Customer',
    cell: (c) => (
      <span className="b-who">
        <span className="b-live-name">{c.name}</span>
        <span className="b-live-meta">{c.email}</span>
      </span>
    ),
  },
  { label: 'Orders', right: true, mono: true, cell: (c) => int(c.orders) },
  { label: 'Spent', right: true, mono: true, cell: (c) => usd2(c.spent) },
  { label: 'Last order', muted: true, cell: (c) => c.lastOrder ?? 'None' },
];

export function CustomersPage({ enabled }: { enabled: boolean }) {
  const [page, setPage] = useState(1);
  const { data, isError, refetch } = useCustomers(page, enabled);
  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';

  return (
    <>
      <PageTitle slug="customers" title="Customers" />
      <section className="b-card b-card-g14" aria-label="Customer list">
        <h2 className="b-h2">Top customers by spend</h2>
        <Async state={state} onRetry={() => void refetch()} skeleton={<TableSkeleton rows={10} />}>
          <DataTable caption="Customers" columns={COLUMNS} rows={data?.items ?? []} rowKey={(c) => c.email} testId="customers-table" />
        </Async>
        <Pager pagination={state === 'ready' ? data?.pagination : undefined} noun="customers" onPageChange={setPage} />
      </section>
    </>
  );
}
