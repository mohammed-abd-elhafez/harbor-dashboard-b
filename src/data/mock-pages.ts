import { parseRange } from '../domain/range';
import type { AnalyticsDto, CustomerRow, OrderRow, OrderStatus, Page, ProductRow, RangeKey } from '../domain/types';
import { generateOverview } from './generate';
import { overview30d } from './fixtures';

// Deterministic demo data for the pages beyond the overview (MSW only; the real API computes these).
const STATUS_CYCLE: OrderStatus[] = ['paid', 'shipped', 'paid', 'pending', 'paid', 'refunded', 'shipped', 'paid'];
const ITEMS = overview30d.recentOrders.map((o) => o.item);
const NAMES = ['Amira Hassan', 'Daniel Okoye', 'Mei Tanaka', 'Lucas Moreau', 'Sara Khaled', 'Omar Haddad', 'Layla Silva', 'Noah Nakamura', 'Yuki Singh', 'Priya Rossi', 'Mateo Ibrahim', 'Hana Novak'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TOTAL_ORDERS = 120;

const dayLabel = (daysBack: number): string => {
  const d = new Date(Date.UTC(2026, 9, 31) - daysBack * 86_400_000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

const ORDERS: OrderRow[] = Array.from({ length: TOTAL_ORDERS }, (_, i) => {
  const base = overview30d.recentOrders[i];
  if (base) return { ...base, date: 'Oct 31' };
  return {
    id: `#${10482 - i}`,
    customer: NAMES[(i * 5) % NAMES.length]!,
    item: ITEMS[i % ITEMS.length]!,
    total: Math.round((18 + ((i * 37) % 95) + (i % 3) * 0.5) * 100) / 100,
    status: STATUS_CYCLE[i % STATUS_CYCLE.length]!,
    time: `${String(17 - (i % 17)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
    date: dayLabel(Math.floor(i / 6)),
  };
});

const pageOf = <T>(items: T[], page: number, limit: number): Page<T> => {
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return { items: slice, pagination: { shown: slice.length, total: items.length, page, pages: Math.max(1, Math.ceil(items.length / limit)) } };
};

const num = (v: string | null, fallback: number): number => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export function mockOrders(params: URLSearchParams): Page<OrderRow> {
  const status = params.get('status');
  const rows = status ? ORDERS.filter((o) => o.status === status) : ORDERS;
  return pageOf(rows, num(params.get('page'), 1), Math.min(100, num(params.get('limit'), 5)));
}

const SCALE: Record<RangeKey, number> = { '24h': 0.04, '7d': 0.24, '30d': 1, '90d': 2.9 };

export function mockProducts(params: URLSearchParams): { items: ProductRow[] } {
  const k = SCALE[parseRange(`?${params}`)];
  const sold = [520, 410, 220, 134];
  const unit = [64, 38.5, 27, 112.2];
  const items = generateOverview(parseRange(`?${params}`)).inventory.map((inv, i) => ({
    ...inv,
    unitsSold: Math.round(sold[i]! * k),
    revenue: Math.round(sold[i]! * k * unit[i]! * 100) / 100,
  }));
  return { items: items.sort((a, b) => b.revenue - a.revenue) };
}

const CUSTOMERS: CustomerRow[] = Array.from({ length: 65 }, (_, i) => {
  const name = i < NAMES.length ? NAMES[i]! : `${NAMES[i % NAMES.length]!.split(' ')[0]} ${['Costa', 'Weber', 'Lopez', 'Sato', 'Adeyemi'][i % 5]}`;
  return {
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}${i >= NAMES.length ? i : ''}@example.com`,
    orders: Math.max(1, 38 - i),
    spent: Math.round((1450 - i * 19.5) * 100) / 100,
    lastOrder: dayLabel(i % 20),
  };
});

export function mockCustomers(params: URLSearchParams): Page<CustomerRow> {
  return pageOf(CUSTOMERS, num(params.get('page'), 1), Math.min(100, num(params.get('limit'), 10)));
}

export function mockAnalytics(params: URLSearchParams): AnalyticsDto {
  const data = generateOverview(parseRange(`?${params}`));
  const orders = data.kpis.find((k) => k.id === 'orders')!.value;
  const split = [0.7, 0.2, 0.06, 0.04];
  const counts = (['paid', 'shipped', 'pending', 'refunded'] as const).map((_, i) => Math.round(orders * split[i]!));
  counts[0]! += orders - counts.reduce((a, b) => a + b, 0);
  const visits = Math.round(40000 * SCALE[data.range]);
  return {
    range: data.range,
    periodLabel: data.periodLabel,
    revenueSeries: data.revenueSeries,
    statuses: (['paid', 'shipped', 'pending', 'refunded'] as const).map((status, i) => ({
      status,
      count: counts[i]!,
      percent: Math.round(split[i]! * 100),
    })),
    sources: data.traffic.map((t) => {
      const v = Math.round((visits * t.percent) / 100);
      const conversions = Math.round(v * 0.0342);
      return { id: t.id, label: t.label, visits: v, conversions, rate: v === 0 ? 0 : Math.round((conversions / v) * 1000) / 10, percent: t.percent };
    }),
  };
}
