import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UnauthenticatedError } from '../data/api';
import { useOrdersPage, useOverview } from '../data/queries';
import { mocksEnabled } from '../data/repository';
import { useSession, useSignOut } from '../data/session';
import { useLiveOrders } from '../data/useLiveOrders';
import { DarkOpsPage } from '../dashboard/DarkOpsPage';
import { SignIn } from '../dashboard/SignIn';
import { parseRange } from '../domain/range';
import type { RangeKey } from '../domain/types';
import type { LoadState } from '../ui/Async';

// Mock mode (default) needs no sign-in and keeps the pager inert; the real API enables both.
const REAL_API = !mocksEnabled();

export function App() {
  const qc = useQueryClient();
  const [range, setRange] = useState<RangeKey>(() => parseRange(window.location.search));
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState('');
  const session = useSession(REAL_API);
  const signedIn = !REAL_API || !!session.data;
  const { data, isPlaceholderData, isError, error, isFetching, refetch } = useOverview(range, signedIn);
  const ordersPage = useOrdersPage(range, page, signedIn && REAL_API);
  const liveOrders = useLiveOrders(data?.recentOrders, REAL_API && signedIn);
  const signOut = useSignOut();
  const seen = useRef<unknown>(undefined);

  useEffect(() => {
    const onPop = () => setRange(parseRange(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // An expired session shows up as a 401 on a data request: drop back to the sign-in screen.
  useEffect(() => {
    if (REAL_API && error instanceof UnauthenticatedError) qc.setQueryData(['session'], null);
  }, [error, qc]);

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
    setPage(1);
  }, []);

  if (REAL_API && session.data === null) return <SignIn />;

  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';
  const onFirstPage = page === 1 || !REAL_API;
  const orderLog =
    data && (onFirstPage ? { orders: data.recentOrders, pagination: data.pagination } : ordersPage.data
      ? { orders: ordersPage.data.items, pagination: ordersPage.data.pagination }
      : undefined);

  return (
    <DarkOpsPage
      data={data}
      state={state}
      range={range}
      busy={isPlaceholderData || (isFetching && !data) || (REAL_API && session.isPending)}
      announcement={announcement}
      liveOrders={liveOrders}
      orderLog={orderLog || undefined}
      onPageChange={REAL_API ? setPage : undefined}
      onSignOut={REAL_API ? () => signOut.mutate() : undefined}
      onRangeChange={changeRange}
      onRetry={() => void refetch()}
    />
  );
}
