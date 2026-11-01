import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

const PAGES = [
  { hash: '#/orders', nav: 'Orders', h1: 'Orders', table: 'orders-page-table' },
  { hash: '#/products', nav: 'Products', h1: 'Products', table: 'products-table' },
  { hash: '#/customers', nav: 'Customers', h1: 'Customers', table: 'customers-table' },
  { hash: '#/analytics', nav: 'Analytics', h1: 'Analytics', table: 'sources-table' },
  { hash: '#/settings', nav: 'Settings', h1: 'Settings', table: 'settings' },
] as const;

const ready = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByTestId('main')).toBeVisible();
};

test.describe('navigation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('every rail link opens its page and marks itself current', async ({ page }) => {
    await page.goto('/');
    for (const p of PAGES) {
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: p.nav }).or(page.getByRole('link', { name: 'Settings' })).first().click();
      await expect(page).toHaveURL(new RegExp(`${p.hash}$`));
      await expect(page.getByRole('heading', { level: 1, name: p.h1 })).toBeVisible();
      await expect(page.getByTestId(p.table)).toBeVisible();
      await expect(page.getByRole('link', { name: p.nav, exact: true }).first()).toHaveAttribute('aria-current', 'page');
      await expect(page).toHaveTitle(`${p.h1} · Harbor Goods`);
    }
    await page.getByRole('link', { name: 'Overview' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Store performance' })).toBeVisible();
  });

  test('deep links and unknown routes work', async ({ page }) => {
    await page.goto('/#/customers');
    await expect(page.getByRole('heading', { level: 1, name: 'Customers' })).toBeVisible();
    await page.goto('/#/does-not-exist');
    await expect(page.getByRole('heading', { level: 1, name: 'Store performance' })).toBeVisible();
  });

  test('"Open all orders" on the overview goes to the orders page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Open all orders/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
  });
});

test.describe('page behaviour', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('orders: filter by status and page through results', async ({ page }) => {
    await page.goto('/#/orders');
    const rows = page.locator('[data-testid="orders-page-table"] tbody tr');
    await expect(rows).toHaveCount(10);
    await expect(page.getByText(/^10 of 120 orders · page 1 \/ 12$/)).toBeVisible();
    const firstId = await rows.first().locator('td').first().textContent();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/page 2 \/ 12$/)).toBeVisible();
    await expect(rows.first().locator('td').first()).not.toHaveText(firstId ?? '');

    await page.getByRole('button', { name: 'Refunded' }).click();
    await expect(page.getByRole('button', { name: 'Refunded' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/page 1 \//)).toBeVisible();
    const statuses = await rows.locator('td:last-child').allTextContents();
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every((s) => s.includes('Refunded'))).toBe(true);
  });

  test('products and analytics follow the time range', async ({ page }) => {
    await page.goto('/#/products');
    const units = () => page.locator('[data-testid="products-table"] tbody tr').first().locator('td').nth(3).textContent();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const month = await units();
    await page.getByRole('button', { name: '7d' }).click();
    await expect.poll(units).not.toBe(month);

    await page.getByRole('link', { name: 'Analytics' }).click();
    await expect(page.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('revenue-chart-svg')).toBeVisible();
    await expect(page.getByTestId('card-status')).toContainText('Paid');
  });

  test('customers page pages through the list', async ({ page }) => {
    await page.goto('/#/customers');
    await expect(page.getByText(/^10 of 65 customers · page 1 \/ 7$/)).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/page 2 \/ 7$/)).toBeVisible();
  });

  test('settings shows the account and store details', async ({ page }) => {
    await page.goto('/#/settings');
    await expect(page.getByTestId('settings')).toContainText('demo@example.com');
    await expect(page.getByTestId('settings')).toContainText('Demo data (mock API)');
  });
});

for (const width of [1440, 390] as const) {
  test.describe(`a11y at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const p of PAGES) {
      test(`${p.h1}: axe clean and no horizontal scroll`, async ({ page }) => {
        await page.goto(`/${p.hash}`);
        await expect(page.getByRole('heading', { level: 1, name: p.h1 })).toBeVisible();
        await expect(page.getByTestId(p.table)).toBeVisible();
        await ready(page);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
      });
    }
  });
}
