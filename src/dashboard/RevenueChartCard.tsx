import { useLayoutEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../app/useMediaQuery';
import { LineAreaChart } from '../charts/LineAreaChart';
import { samplePoints } from '../domain/chart-math';
import { usd0 } from '../domain/format';
import type { OverviewDto } from '../domain/types';
import { Async, Skeleton, type LoadState } from '../ui/Async';

/** >= 1280: scaled reference chart. Below: measured width, native 12px labels (spec 12). */
function ChartArea({ series }: { series: OverviewDto['revenueSeries']['points'] }) {
  const wide = useMediaQuery('(min-width: 1280px)');
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (wide || !el) return;
    setWidth(Math.round(el.clientWidth));
    const ro = new ResizeObserver(([entry]) => entry && setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);
  if (wide) return <LineAreaChart series={series} />;
  return <div ref={ref}>{width > 0 && <LineAreaChart series={series} width={Math.max(width, 240)} />}</div>;
}

interface Props {
  data: Pick<OverviewDto, 'periodLabel' | 'revenueSeries'> | undefined;
  state: LoadState;
  onRetry: () => void;
}

export function RevenueChartCard({ data, state, onRetry }: Props) {
  const meta = data ? `${data.periodLabel.replace(/, \d{4}$/, '')} · USD` : '';
  const rows = data ? samplePoints(data.revenueSeries.points) : [];
  return (
    <div className="b-card b-card-chart" data-testid="card-revenue-chart">
      <div className="b-card-head b-card-head-wrap">
        <h2 className="b-h2">Revenue, daily</h2>
        <span className="b-mono13 b-muted">{meta}</span>
      </div>
      <Async
        state={state}
        onRetry={onRetry}
        skeleton={<Skeleton height={0} style={{ aspectRatio: '680 / 250', height: 'auto' }} />}
      >
        {data && (
          <>
            <ChartArea series={data.revenueSeries.points} />
            <table className="sr-only">
              <caption>Daily revenue data</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.label}>
                    <th scope="row">{p.label}</th>
                    <td>{usd0(p.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Async>
    </div>
  );
}
