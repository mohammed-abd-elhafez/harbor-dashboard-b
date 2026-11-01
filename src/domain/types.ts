export type RangeKey = '24h' | '7d' | '30d' | '90d';
export type OrderStatus = 'paid' | 'pending' | 'shipped' | 'refunded';
export type DeltaDirection = 'up' | 'down';

export interface Kpi {
  id: 'revenue' | 'orders' | 'conversion' | 'avgOrder';
  label: string;
  value: number;
  delta: { value: number; unit: 'percent' | 'pt'; direction: DeltaDirection };
}

export interface SeriesPoint {
  label: string;
  value: number;
}
export interface Series {
  points: SeriesPoint[];
}

export interface TrafficSource {
  id: 'search' | 'direct' | 'social' | 'email';
  label: string;
  percent: number;
}

export interface OrderRow {
  id: string;
  customer: string;
  item: string;
  total: number;
  status: OrderStatus;
  time: string;
  /** 'Oct 31'. Absent in the fixed overview fixture. */
  date?: string;
}

export interface InventoryItem {
  name: string;
  stock: number;
  level: 'ok' | 'low' | 'critical';
  fillPercent: number;
}
export interface Pagination {
  shown: number;
  total: number;
  page: number;
  pages: number;
}

export interface OverviewDto {
  range: RangeKey;
  periodLabel: string;
  comparedShort: string;
  updatedAt: string;
  kpis: Kpi[];
  revenueSeries: Series;
  traffic: TrafficSource[];
  recentOrders: OrderRow[];
  pagination: Pagination;
  inventory: InventoryItem[];
  store: { name: string; initial: string };
}

export interface ProductRow {
  name: string;
  stock: number;
  level: 'ok' | 'low' | 'critical';
  fillPercent: number;
  unitsSold: number;
  revenue: number;
}

export interface CustomerRow {
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastOrder: string | null;
}

export interface AnalyticsDto {
  range: RangeKey;
  periodLabel: string;
  revenueSeries: Series;
  statuses: { status: OrderStatus; count: number; percent: number }[];
  sources: { id: TrafficSource['id']; label: string; visits: number; conversions: number; rate: number; percent: number }[];
}

export interface SettingsDto {
  user: { email: string };
  store: { name: string; timezone: string };
  stock: { low: number; critical: number };
  version: string;
}

export interface Page<T> {
  items: T[];
  pagination: Pagination;
}
