import type { OrderRow, OverviewDto, Pagination, RangeKey } from '../domain/types';
import { apiFetch } from './api';

export interface OrdersPage {
  items: OrderRow[];
  pagination: Pagination;
}

export interface DashboardRepository {
  getOverview(range: RangeKey): Promise<OverviewDto>;
  getOrders(range: RangeKey, page: number, limit: number): Promise<OrdersPage>;
}

/** Talks to the real harbor-api (cookie session). */
export class HttpRepository implements DashboardRepository {
  async getOverview(range: RangeKey): Promise<OverviewDto> {
    return (await (await apiFetch(`/api/overview?range=${encodeURIComponent(range)}`)).json()) as OverviewDto;
  }

  async getOrders(range: RangeKey, page: number, limit: number): Promise<OrdersPage> {
    const qs = new URLSearchParams({ range, page: String(page), limit: String(limit) });
    return (await (await apiFetch(`/api/orders?${qs}`)).json()) as OrdersPage;
  }
}

/** Talks to /api/*, which MSW answers with the spec fixtures (no server, no sign-in). */
export class MockApiRepository extends HttpRepository {}

export const mocksEnabled = (): boolean => import.meta.env.VITE_USE_MOCKS !== 'false';

export const createRepository = (): DashboardRepository => (mocksEnabled() ? new MockApiRepository() : new HttpRepository());
