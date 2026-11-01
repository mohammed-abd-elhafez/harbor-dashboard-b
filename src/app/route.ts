import { useSyncExternalStore } from 'react';

export const ROUTES = ['overview', 'orders', 'products', 'customers', 'analytics', 'settings'] as const;
export type RouteKey = (typeof ROUTES)[number];

export const ROUTE_TITLES: Record<RouteKey, string> = {
  overview: 'Overview',
  orders: 'Orders',
  products: 'Products',
  customers: 'Customers',
  analytics: 'Analytics',
  settings: 'Settings',
};

/** `#/orders` -> `orders`. Anything unknown falls back to the overview. */
export function parseRoute(hash: string): RouteKey {
  const first = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return ROUTES.find((r) => r === first) ?? 'overview';
}

export const routeHref = (route: RouteKey): string => (route === 'overview' ? '#/' : `#/${route}`);

const subscribe = (notify: () => void) => {
  window.addEventListener('hashchange', notify);
  return () => window.removeEventListener('hashchange', notify);
};

/** Hash routing works on any static host (including GitHub Pages) and needs no server fallback. */
export function useRoute(): RouteKey {
  return parseRoute(useSyncExternalStore(subscribe, () => window.location.hash, () => ''));
}
