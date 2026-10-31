import { useCallback, useEffect, useRef, useState } from 'react';
import { useOverview } from '../data/queries';
import { DarkOpsPage } from '../dashboard/DarkOpsPage';
import { parseRange } from '../domain/range';
import type { RangeKey } from '../domain/types';
import type { LoadState } from '../ui/Async';

export function App() {
  const [range, setRange] = useState<RangeKey>(() => parseRange(window.location.search));
  const [announcement, setAnnouncement] = useState('');
  const { data, isPlaceholderData, isError, isFetching, refetch } = useOverview(range);
  const seen = useRef<unknown>(undefined);

  useEffect(() => {
    const onPop = () => setRange(parseRange(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Polite live region: announce when fresh data replaces loading or a previous range (spec 10.2).
  useEffect(() => {
    if (data && !isPlaceholderData && seen.current !== data) {
      seen.current = data;
      setAnnouncement('Dashboard updated');
    }
  }, [data, isPlaceholderData]);

  const changeRange = useCallback((next: RangeKey) => {
    const url = new URL(window.location.href);
    url.searchParams.set('range', next);
    window.history.pushState(null, '', url);
    setRange(next);
  }, []);

  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';

  return (
    <DarkOpsPage
      data={data}
      state={state}
      range={range}
      busy={isPlaceholderData || (isFetching && !data)}
      announcement={announcement}
      onRangeChange={changeRange}
      onRetry={() => void refetch()}
    />
  );
}
