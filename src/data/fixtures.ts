import type { OverviewDto } from '../domain/types';

export const overview30d: OverviewDto = {
  range: '30d',
  periodLabel: 'Oct 1 – Oct 31, 2026',
  comparedShort: 'Sep',
  updatedAt: '18:04',
  kpis: [
    { id: 'revenue', label: 'Revenue', value: 48920, delta: { value: 12.4, unit: 'percent', direction: 'up' } },
    { id: 'orders', label: 'Orders', value: 1284, delta: { value: 8.1, unit: 'percent', direction: 'up' } },
    { id: 'conversion', label: 'Conversion', value: 3.42, delta: { value: 0.4, unit: 'pt', direction: 'up' } },
    { id: 'avgOrder', label: 'Avg. order', value: 38.1, delta: { value: 2.3, unit: 'percent', direction: 'down' } },
  ],
  revenueSeries: {
    points: [
      { label: 'Oct 1', value: 1200 }, { label: 'Oct 3', value: 1400 }, { label: 'Oct 5', value: 1100 },
      { label: 'Oct 7', value: 1600 }, { label: 'Oct 9', value: 1800 }, { label: 'Oct 11', value: 1500 },
      { label: 'Oct 13', value: 1300 }, { label: 'Oct 15', value: 1700 }, { label: 'Oct 17', value: 2000 },
      { label: 'Oct 19', value: 1900 }, { label: 'Oct 21', value: 1600 }, { label: 'Oct 23', value: 1800 },
      { label: 'Oct 25', value: 2200 }, { label: 'Oct 27', value: 1900 }, { label: 'Oct 29', value: 2100 },
      { label: 'Oct 31', value: 2300 },
    ],
  },
  traffic: [
    { id: 'search', label: 'Search', percent: 38 },
    { id: 'direct', label: 'Direct', percent: 27 },
    { id: 'social', label: 'Social', percent: 21 },
    { id: 'email', label: 'Email', percent: 14 },
  ],
  recentOrders: [
    { id: '#10482', customer: 'Amira Hassan', item: 'Linen Throw, Sand', total: 64.0, status: 'paid', time: '18:02' },
    { id: '#10481', customer: 'Daniel Okoye', item: 'Ceramic Mug Set', total: 38.5, status: 'pending', time: '17:51' },
    { id: '#10480', customer: 'Mei Tanaka', item: 'Oak Serving Board', total: 112.2, status: 'shipped', time: '17:38' },
    { id: '#10479', customer: 'Lucas Moreau', item: 'Wool Socks, 3-pack', total: 27.0, status: 'refunded', time: '17:20' },
    { id: '#10478', customer: 'Sara Khaled', item: 'Linen Throw, Sand', total: 89.9, status: 'paid', time: '17:05' },
  ],
  pagination: { shown: 5, total: 1284, page: 1, pages: 257 },
  inventory: [
    { name: 'Linen Throw, Sand', stock: 118, level: 'ok', fillPercent: 90 },
    { name: 'Ceramic Mug Set', stock: 74, level: 'ok', fillPercent: 58 },
    { name: 'Wool Socks, 3-pack', stock: 11, level: 'low', fillPercent: 12 },
    { name: 'Oak Serving Board', stock: 6, level: 'critical', fillPercent: 6 },
  ],
  store: { name: 'Harbor Goods', initial: 'H' },
};
