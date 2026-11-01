import { useProducts } from '../data/queries';
import { int, usd0 } from '../domain/format';
import type { ProductRow, RangeKey } from '../domain/types';
import { Async, Skeleton, type LoadState } from '../ui/Async';
import { DataTable, type Column } from '../ui/DataTable';
import { ProgressBar } from '../ui/ProgressBar';
import { RangeGroup } from '../ui/RangeGroup';
import { PageTitle, TableSkeleton } from './PageTitle';

const LEVEL_COLOR: Record<ProductRow['level'], string> = { ok: 'var(--pos)', low: 'var(--accent)', critical: 'var(--neg)' };
const LEVEL_TEXT: Record<ProductRow['level'], string> = { ok: 'In stock', low: 'Low', critical: 'Critical' };

const COLUMNS: Column<ProductRow>[] = [
  { label: 'Product', cell: (p) => p.name },
  {
    label: 'Stock',
    cell: (p) => (
      <span className="b-stock">
        <span className="b-mono">{p.stock}</span>
        <span style={{ color: LEVEL_COLOR[p.level] }}>{LEVEL_TEXT[p.level]}</span>
      </span>
    ),
  },
  { label: 'Coverage', cell: (p) => <div className="b-coverage"><ProgressBar percent={p.fillPercent} color={LEVEL_COLOR[p.level]} /></div> },
  { label: 'Units sold', right: true, mono: true, cell: (p) => int(p.unitsSold) },
  { label: 'Revenue', right: true, mono: true, cell: (p) => usd0(p.revenue) },
];

export function ProductsPage({ range, onRangeChange, enabled }: { range: RangeKey; onRangeChange: (r: RangeKey) => void; enabled: boolean }) {
  const { data, isError, refetch } = useProducts(range, enabled);
  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';
  const rows = data ?? [];
  const summary = [
    { label: 'Products', value: int(rows.length) },
    { label: 'Needs restock', value: int(rows.filter((p) => p.level !== 'ok').length) },
    { label: 'Units sold', value: int(rows.reduce((s, p) => s + p.unitsSold, 0)) },
  ];

  return (
    <>
      <PageTitle slug="products" title="Products">
        <RangeGroup range={range} onRangeChange={onRangeChange} />
      </PageTitle>
      <section aria-label="Product summary" className="b-kpis">
        {summary.map((s) => (
          <div key={s.label} className="b-kpi">
            <span className="b-kpi-label">{s.label}</span>
            {state === 'ready' ? <span className="b-kpi-value">{s.value}</span> : <Skeleton width={120} height={32} style={{ margin: '6px 0' }} />}
          </div>
        ))}
      </section>
      <section className="b-card b-card-g14" aria-label="Product list">
        <h2 className="b-h2">Inventory and sales</h2>
        <Async state={state} onRetry={() => void refetch()} skeleton={<TableSkeleton rows={4} />}>
          <DataTable caption="Products" columns={COLUMNS} rows={rows} rowKey={(p) => p.name} testId="products-table" />
        </Async>
      </section>
    </>
  );
}
