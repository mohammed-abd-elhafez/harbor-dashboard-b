import type { OverviewDto, RangeKey } from '../domain/types';
import type { LoadState } from '../ui/Async';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { InventoryCard, TrafficDonutCard } from './SideColumn';
import { KpiStrip } from './KpiStrip';
import { LiveOrdersCard } from './LiveOrdersCard';
import { OrderLogCard } from './OrderLogCard';
import { PageHeader } from './PageHeader';
import { Rail } from './Rail';
import { RevenueChartCard } from './RevenueChartCard';

interface Props {
  data: OverviewDto | undefined;
  state: LoadState;
  range: RangeKey;
  busy: boolean;
  announcement: string;
  onRangeChange: (range: RangeKey) => void;
  onRetry: () => void;
}

export function DarkOpsPage({ data, state, range, busy, announcement, onRangeChange, onRetry }: Props) {
  const s = { state, onRetry };
  return (
    <div className="b-root" data-variant="dark-ops">
      <a href="#main" className="b-skip">Skip to main content</a>
      <div role="status"><VisuallyHidden>{announcement}</VisuallyHidden></div>
      <Rail initial={data?.store.initial ?? 'H'} />
      <main id="main" tabIndex={-1} className="b-main" data-testid="main" aria-busy={busy}>
        <PageHeader updatedAt={data?.updatedAt ?? '--:--'} range={range} onRangeChange={onRangeChange} />
        <KpiStrip kpis={data?.kpis} comparedShort={data?.comparedShort ?? ''} {...s} />
        <section className="b-row" aria-label="Revenue and live orders">
          <RevenueChartCard data={data} {...s} />
          <LiveOrdersCard orders={data?.recentOrders} {...s} />
        </section>
        <section className="b-row" aria-label="Orders, traffic and inventory">
          <OrderLogCard orders={data?.recentOrders} pagination={data?.pagination} {...s} />
          <div className="b-col-side" data-testid="col-side">
            <TrafficDonutCard traffic={data?.traffic} {...s} />
            <InventoryCard items={data?.inventory} {...s} />
          </div>
        </section>
      </main>
    </div>
  );
}
