import { test, expect, type Page } from '@playwright/test';
import { overview30d } from '../../src/data/fixtures';

// Block MSW's service worker so page.route fully controls /api/overview.
test.use({ serviceWorkers: 'block', viewport: { width: 1440, height: 1160 } });

const json = (body: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

async function serve(page: Page, body: unknown = overview30d, delayMs = 0) {
  await page.route('**/api/overview*', async (route) => {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill(json(body));
  });
}

test('loading shows skeletons without changing card layout', async ({ page }) => {
  await serve(page, overview30d, 1500);
  await page.goto('/');
  await expect(page.getByTestId('kpi-0')).toBeVisible();
  const loading = await page.getByTestId('card-revenue-chart').boundingBox();
  await expect(page.getByTestId('revenue-chart-svg')).toBeVisible({ timeout: 5000 });
  const loaded = await page.getByTestId('card-revenue-chart').boundingBox();
  expect(Math.abs(loading!.height - loaded!.height)).toBeLessThanOrEqual(2);
  await expect(page.getByRole('status').filter({ hasText: 'Dashboard updated' })).toHaveCount(1);
});

test('error state shows retry that recovers', async ({ page }) => {
  let fail = true;
  await page.route('**/api/overview*', (route) =>
    fail ? route.fulfill({ status: 500, body: 'x' }) : route.fulfill(json(overview30d)),
  );
  await page.goto('/');
  await expect(page.getByText("Couldn't load this section").first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Store performance' })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).first().click();
  await expect(page.getByTestId('orders-table')).toBeVisible();
});

test('empty orders state', async ({ page }) => {
  await serve(page, { ...overview30d, recentOrders: [], pagination: { shown: 0, total: 0, page: 1, pages: 1 } });
  await page.goto('/');
  await expect(page.getByText('No orders in this period')).toBeVisible();
  await expect(page.getByText('0 of 0 orders · page 1 / 1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prev' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
});

test('range buttons drive the URL and invalid values fall back', async ({ page }) => {
  await serve(page);
  await page.goto('/?range=bogus');
  await expect(page.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '7d' }).click();
  await expect(page).toHaveURL(/range=7d/);
  await expect(page.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
});

test('skip link is first tab stop and focus is visible', async ({ page }) => {
  await serve(page);
  await page.goto('/');
  await expect(page.getByTestId('orders-table')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Tab');
  const style = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(style).not.toBe('none');
});
