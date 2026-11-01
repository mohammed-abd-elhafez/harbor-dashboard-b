import { DONUT_COLORS } from '../domain/chart-math';
import { useAnalytics } from '../data/queries';
import { int } from '../domain/format';
import type { AnalyticsDto, OrderStatus, RangeKey } from '../domain/types';
import { RevenueChartCard } from '../dashboard/RevenueChartCard';
import { Async, type LoadState } from '../ui/Async';
import { DataTable, type Column } from '../ui/DataTable';
import { ProgressBar } from '../ui/ProgressBar';
import { RangeGroup } from '../ui/RangeGroup';
import { PageTitle, TableSkeleton } from './PageTitle';

type SourceRow = AnalyticsDto['sources'][number];

const STATUS_STYLE: Record<OrderStatus, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'var(--pos)' },
  shipped: { label: 'Shipped', color: 'var(--info)' },
  pending: { label: 'Pending', color: 'var(--accent)' },
  refunded: { label: 'Refunded', color: 'var(--neg)' },
};

const SOURCE_COLUMNS: Column<SourceRow>[] = [
  {
    label: 'Source',
    cell: (s) => (
      <span className="b-legend-name">
        <span className="b-swatch" style={{ background: DONUT_COLORS[s.id] }} aria-hidden="true" />
        {s.label}
      </span>
    ),
  },
  { label: 'Visits', right: true, mono: true, cell: (s) => int(s.visits) },
  { label: 'Conversions', right: true, mono: true, cell: (s) => int(s.conversions) },
  { label: 'Conv. rate', right: true, mono: true, cell: (s) => `${s.rate.toFixed(1)}%` },
  { label: 'Share', right: true, mono: true, cell: (s) => `${s.percent}%` },
];

export function AnalyticsPage({ range, onRangeChange, enabled }: { range: RangeKey; onRangeChange: (r: RangeKey) => void; enabled: boolean }) {
  const { data, isError, refetch } = useAnalytics(range, enabled);
  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';
  const retry = () => void refetch();

  return (
    <>
      <PageTitle slug="analytics" title="Analytics">
        <RangeGroup range={range} onRangeChange={onRangeChange} />
      </PageTitle>
      <section className="b-row" aria-label="Revenue and order status">
        <RevenueChartCard data={data} state={state} onRetry={retry} />
        <div className="b-card b-card-live" data-testid="card-status">
          <h2 className="b-h2">Orders by status</h2>
          <Async state={state} onRetry={retry} skeleton={<TableSkeleton rows={4} />}>
            {(data?.statuses ?? []).map((s) => (
              <div key={s.status} className="b-inv-row">
                <div className="b-inv-label">
                  <span>{STATUS_STYLE[s.status].label}</span>
                  <span className="b-mono">{`${int(s.count)} · ${s.percent}%`}</span>
                </div>
                <ProgressBar percent={s.percent} color={STATUS_STYLE[s.status].color} />
              </div>
            ))}
          </Async>
        </div>
      </section>
      <section className="b-card b-card-g14" aria-label="Traffic sources">
        <h2 className="b-h2">Traffic sources</h2>
        <Async state={state} onRetry={retry} skeleton={<TableSkeleton rows={4} />}>
          <DataTable caption="Traffic sources" columns={SOURCE_COLUMNS} rows={data?.sources ?? []} rowKey={(s) => s.id} testId="sources-table" />
        </Async>
      </section>
    </>
  );
}
