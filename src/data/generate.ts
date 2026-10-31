import type { InventoryItem, OverviewDto, RangeKey, SeriesPoint } from '../domain/types';
import { overview30d } from './fixtures';

// DERIVED (spec 10.3): only 30d is designed. Other ranges are deterministic samples with the same shape.
const END = Date.UTC(2026, 9, 31);
const DAY = 86_400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SPAN_DAYS: Record<RangeKey, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
const COMPARED: Record<RangeKey, string> = { '24h': 'Oct 30', '7d': 'prev 7d', '30d': 'Sep', '90d': 'prev 90d' };
const SCALE: Record<RangeKey, number> = { '24h': 0.04, '7d': 0.24, '30d': 1, '90d': 2.9 };

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedOf = (key: string): number => [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const fmtDay = (ms: number): string => `${MONTHS[new Date(ms).getUTCMonth()]} ${new Date(ms).getUTCDate()}`;

function periodLabel(range: RangeKey): string {
  const start = END - (SPAN_DAYS[range] - 1) * DAY;
  return range === '24h' ? 'Oct 31, 2026' : `${fmtDay(start)} – Oct 31, 2026`;
}

function buildSeries(range: RangeKey): SeriesPoint[] {
  const rand = mulberry32(seedOf(range));
  const span = SPAN_DAYS[range];
  return Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    const label = range === '24h' ? `${String(Math.round(t * 23)).padStart(2, '0')}:00` : fmtDay(END - span * DAY * (1 - t) + (range === '30d' ? 0 : DAY));
    const value = Math.round((900 + 1100 * t + rand() * 300) / 100) * 100;
    return { label, value };
  });
}

function inventoryFor(range: RangeKey): InventoryItem[] {
  const rand = mulberry32(seedOf(`inv-${range}`));
  return overview30d.inventory.map((item) => {
    const stock = Math.max(1, Math.round(item.stock * (0.8 + rand() * 0.4)));
    const level: InventoryItem['level'] = stock <= 8 ? 'critical' : stock <= 15 ? 'low' : 'ok';
    return { name: item.name, stock, level, fillPercent: Math.min(100, Math.round((stock / 130) * 100)) };
  });
}

export function generateOverview(range: RangeKey): OverviewDto {
  if (range === '30d') return overview30d;
  const k = SCALE[range];
  const orders = Math.max(1, Math.round(1284 * k));
  const revenue = Math.round(48920 * k);
  const kpis = overview30d.kpis.map((kpi) => {
    const value =
      kpi.id === 'revenue' ? revenue : kpi.id === 'orders' ? orders : kpi.id === 'avgOrder' ? Math.round((revenue / orders) * 100) / 100 : kpi.value;
    return { ...kpi, value };
  });
  return {
    ...overview30d,
    range,
    periodLabel: periodLabel(range),
    comparedShort: COMPARED[range],
    kpis,
    revenueSeries: { points: buildSeries(range) },
    pagination: { shown: 5, total: orders, page: 1, pages: Math.max(1, Math.ceil(orders / 5)) },
    inventory: inventoryFor(range),
  };
}
