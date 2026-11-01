import { http, HttpResponse } from 'msw';
import { parseRange } from '../domain/range';
import { generateOverview } from './generate';
import { mockAnalytics, mockCustomers, mockOrders, mockProducts } from './mock-pages';

const params = (request: Request): URLSearchParams => new URL(request.url).searchParams;

export const handlers = [
  http.get('/api/overview', ({ request }) => HttpResponse.json(generateOverview(parseRange(new URL(request.url).search)))),
  http.get('/api/orders', ({ request }) => HttpResponse.json(mockOrders(params(request)))),
  http.get('/api/products', ({ request }) => HttpResponse.json(mockProducts(params(request)))),
  http.get('/api/customers', ({ request }) => HttpResponse.json(mockCustomers(params(request)))),
  http.get('/api/analytics', ({ request }) => HttpResponse.json(mockAnalytics(params(request)))),
  http.get('/api/settings', () =>
    HttpResponse.json({
      user: { email: 'demo@example.com' },
      store: { name: 'Harbor Goods', timezone: 'UTC' },
      stock: { low: 15, critical: 8 },
      version: 'demo',
    }),
  ),
];
