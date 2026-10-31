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
