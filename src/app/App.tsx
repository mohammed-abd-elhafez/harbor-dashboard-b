import { useCallback, useEffect, useRef, useState } from 'react';
import { useOrdersPage, useOverview } from '../data/queries';
import { mocksEnabled } from '../data/repository';
import { useSession, useSignOut } from '../data/session';
import { useLiveOrders } from '../data/useLiveOrders';
import { DarkOpsPage } from '../dashboard/DarkOpsPage';
import { Shell } from '../dashboard/Shell';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { useRoute } from './route';
import { SignIn } from '../dashboard/SignIn';
import { parseRange } from '../domain/range';
import type { RangeKey } from '../domain/types';
import type { LoadState } from '../ui/Async';

// Mock mode (default) needs no sign-in and keeps the pager inert; the real API enables both.
const REAL_API = !mocksEnabled();

export function App() {
  const route = useRoute();
  const [range, setRange] = useState<RangeKey>(() => parseRange(window.location.search));
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState('');
  const session = useSession(REAL_API);
  const signedIn = !REAL_API || !!session.data;
  const onOverview = route === 'overview';
  const { data, isPlaceholderData, isError, isFetching, refetch } = useOverview(range, signedIn && onOverview);
  const ordersPage = useOrdersPage(range, page, signedIn && onOverview && REAL_API);
  const liveOrders = useLiveOrders(data?.recentOrders, REAL_API && signedIn && onOverview);
  const signOut = useSignOut();
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
    setPage(1);
  }, []);

  if (REAL_API && session.data === null) return <SignIn />;

  const onSignOut = REAL_API ? () => signOut.mutate() : undefined;
  const state: LoadState = data ? 'ready' : isError ? 'error' : 'loading';
  const onFirstPage = page === 1 || !REAL_API;
  const orderLog =
    data && (onFirstPage ? { orders: data.recentOrders, pagination: data.pagination } : ordersPage.data
      ? { orders: ordersPage.data.items, pagination: ordersPage.data.pagination }
      : undefined);

  return (
    <Shell
      route={route}
      initial={data?.store.initial ?? 'H'}
      busy={onOverview ? isPlaceholderData || (isFetching && !data) || (REAL_API && session.isPending) : REAL_API && session.isPending}
      announcement={onOverview ? announcement : ''}
    >
      {route === 'overview' && (
        <DarkOpsPage
          data={data}
          state={state}
          range={range}
          liveOrders={liveOrders}
          orderLog={orderLog || undefined}
          onPageChange={REAL_API ? setPage : undefined}
          onSignOut={onSignOut}
          onRangeChange={changeRange}
          onRetry={() => void refetch()}
        />
      )}
      {route === 'orders' && <OrdersPage range={range} onRangeChange={changeRange} enabled={signedIn} />}
      {route === 'products' && <ProductsPage range={range} onRangeChange={changeRange} enabled={signedIn} />}
      {route === 'customers' && <CustomersPage enabled={signedIn} />}
      {route === 'analytics' && <AnalyticsPage range={range} onRangeChange={changeRange} enabled={signedIn} />}
      {route === 'settings' && <SettingsPage enabled={signedIn} onSignOut={onSignOut} />}
    </Shell>
  );
}
