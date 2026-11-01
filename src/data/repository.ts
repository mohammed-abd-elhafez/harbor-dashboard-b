import type { AnalyticsDto, CustomerRow, OrderRow, OrderStatus, OverviewDto, Page, Pagination, ProductRow, RangeKey, SettingsDto } from '../domain/types';
import { apiFetch } from './api';

export interface OrdersPage {
  items: OrderRow[];
  pagination: Pagination;
}

export interface OrdersQuery {
  range: RangeKey;
  page: number;
  limit: number;
  status?: OrderStatus | undefined;
}

export interface DashboardRepository {
  getOverview(range: RangeKey): Promise<OverviewDto>;
  getOrders(range: RangeKey, page: number, limit: number): Promise<OrdersPage>;
  listOrders(q: OrdersQuery): Promise<OrdersPage>;
  getProducts(range: RangeKey): Promise<ProductRow[]>;
  getCustomers(page: number, limit: number): Promise<Page<CustomerRow>>;
  getAnalytics(range: RangeKey): Promise<AnalyticsDto>;
  getSettings(): Promise<SettingsDto>;
}

const json = async <T>(path: string): Promise<T> => (await (await apiFetch(path)).json()) as T;

/** Talks to the real harbor-api (cookie session). */
export class HttpRepository implements DashboardRepository {
  async getOverview(range: RangeKey): Promise<OverviewDto> {
    return (await (await apiFetch(`/api/overview?range=${encodeURIComponent(range)}`)).json()) as OverviewDto;
  }

  getOrders(range: RangeKey, page: number, limit: number): Promise<OrdersPage> {
    return this.listOrders({ range, page, limit });
  }

  listOrders({ range, page, limit, status }: OrdersQuery): Promise<OrdersPage> {
    const qs = new URLSearchParams({ range, page: String(page), limit: String(limit) });
    if (status) qs.set('status', status);
    return json(`/api/orders?${qs}`);
  }

  async getProducts(range: RangeKey): Promise<ProductRow[]> {
    return (await json<{ items: ProductRow[] }>(`/api/products?range=${encodeURIComponent(range)}`)).items;
  }

  getCustomers(page: number, limit: number): Promise<Page<CustomerRow>> {
    return json(`/api/customers?page=${page}&limit=${limit}`);
  }

  getAnalytics(range: RangeKey): Promise<AnalyticsDto> {
    return json(`/api/analytics?range=${encodeURIComponent(range)}`);
  }

  getSettings(): Promise<SettingsDto> {
    return json('/api/settings');
  }
}

/** Talks to /api/*, which MSW answers with the spec fixtures (no server, no sign-in). */
export class MockApiRepository extends HttpRepository {}

export const mocksEnabled = (): boolean => import.meta.env.VITE_USE_MOCKS !== 'false';

export const createRepository = (): DashboardRepository => (mocksEnabled() ? new MockApiRepository() : new HttpRepository());
