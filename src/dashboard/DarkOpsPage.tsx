import type { OrderRow, OverviewDto, Pagination, RangeKey } from '../domain/types';
import type { LoadState } from '../ui/Async';
import { InventoryCard, TrafficDonutCard } from './SideColumn';
import { KpiStrip } from './KpiStrip';
import { LiveOrdersCard } from './LiveOrdersCard';
import { OrderLogCard } from './OrderLogCard';
import { PageHeader } from './PageHeader';
import { RevenueChartCard } from './RevenueChartCard';

interface Props {
  data: OverviewDto | undefined;
  state: LoadState;
  range: RangeKey;
  /** Orders for the live feed; defaults to the overview's latest orders. */
  liveOrders?: readonly OrderRow[] | undefined;
  /** Rows and pager state for the order log; defaults to the overview's first page. */
  orderLog?: { orders: readonly OrderRow[]; pagination: Pagination } | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  onSignOut?: (() => void) | undefined;
  onRangeChange: (range: RangeKey) => void;
  onRetry: () => void;
}

export function DarkOpsPage({
  data, state, range, liveOrders, orderLog, onPageChange, onSignOut, onRangeChange, onRetry,
}: Props) {
  const s = { state, onRetry };
  return (
    <>
        <PageHeader updatedAt={data?.updatedAt ?? '--:--'} range={range} onRangeChange={onRangeChange} onSignOut={onSignOut} />
        <KpiStrip kpis={data?.kpis} comparedShort={data?.comparedShort ?? ''} {...s} />
        <section className="b-row" aria-label="Revenue and live orders">
          <RevenueChartCard data={data} {...s} />
          <LiveOrdersCard orders={liveOrders ?? data?.recentOrders} {...s} />
        </section>
        <section className="b-row" aria-label="Orders, traffic and inventory">
          <OrderLogCard
            orders={orderLog?.orders ?? data?.recentOrders}
            pagination={orderLog?.pagination ?? data?.pagination}
            onPageChange={onPageChange}
            {...s}
          />
          <div className="b-col-side" data-testid="col-side">
            <TrafficDonutCard traffic={data?.traffic} {...s} />
            <InventoryCard items={data?.inventory} {...s} />
          </div>
        </section>
    </>
  );
}
