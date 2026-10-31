import { test, expect } from '@playwright/test';

type Rect = [number, number, number, number];
const BOXES: Record<string, Rect> = {
  rail: [0, 0, 73, 1160],
  main: [73, 0, 1367, 1160],
  'page-header': [105, 24, 1303, 57],
  'kpi-strip': [105, 101, 1303, 140],
  'kpi-0': [106, 102, 324.5, 138],
  'kpi-1': [431.5, 102, 324.5, 138],
  'kpi-2': [757, 102, 324.5, 138],
  'kpi-3': [1082.5, 102, 324.5, 138],
  'card-revenue-chart': [105, 261, 814.7, 363],
  'card-live-orders': [939.7, 261, 468.3, 363],
  'revenue-chart-svg': [126, 314, 772.7, 284.1],
  'card-orders': [105, 644, 842.7, 454],
  'orders-table': [126, 721, 800.7, 265],
  'col-side': [967.7, 644, 440.3, 454],
  'donut-svg': [988.7, 699, 120, 120],
  'nav-item-0': [14, 88, 44, 44],
  'nav-item-1': [14, 138, 44, 44],
};
const HEAD_WIDTHS = [112, 173, 234, 126, 156];

test.use({ viewport: { width: 1440, height: 1160 }, deviceScaleFactor: 1 });

test('layout boxes', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="orders-table"]');
  for (const [id, expected] of Object.entries(BOXES)) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box, `missing or hidden: ${id}`).not.toBeNull();
    const actual = [box!.x, box!.y, box!.width, box!.height];
    expected.forEach((v, i) => {
      expect(Math.abs(actual[i]! - v), `${id}[${i}] expected ${v} got ${actual[i]}`).toBeLessThanOrEqual(1);
    });
  }
  const widths = await page
    .locator('[data-testid="orders-table"] thead th')
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
  HEAD_WIDTHS.forEach((v, i) => expect(Math.abs(widths[i]! - v)).toBeLessThanOrEqual(1));
});
