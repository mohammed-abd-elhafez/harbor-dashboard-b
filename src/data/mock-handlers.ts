import { http, HttpResponse } from 'msw';
import { parseRange } from '../domain/range';
import { generateOverview } from './generate';

export const handlers = [
  http.get('/api/overview', ({ request }) => {
    const range = parseRange(new URL(request.url).search);
    return HttpResponse.json(generateOverview(range));
  }),
  // The mocks only have one page of orders.
  http.get('/api/orders', ({ request }) => {
    const data = generateOverview(parseRange(new URL(request.url).search));
    return HttpResponse.json({ items: data.recentOrders, pagination: data.pagination });
  }),
];
