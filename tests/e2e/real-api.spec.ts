import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

// Runs against a real harbor-api and a dev server started with VITE_USE_MOCKS=false.
// Enable with RUN_REAL_API=1 and provide E2E_EMAIL / E2E_PASSWORD (the admin created by `npm run seed`).
const enabled = process.env.RUN_REAL_API === '1';
const email = process.env.E2E_EMAIL ?? '';
const password = process.env.E2E_PASSWORD ?? '';

test.skip(!enabled, 'set RUN_REAL_API=1 with a running harbor-api and dev server');
test.use({ baseURL: process.env.REAL_API_APP_URL ?? 'http://localhost:5174', serviceWorkers: 'block' });

test('sign in, page through orders, receive a live order, sign out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in to Harbor Goods' })).toBeVisible();
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid email or password');

  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('$48,920')).toBeVisible();
  // Simulated orders may have grown the total, so assert the shape rather than exact counts.
  await expect(page.getByText(/^5 of [\d,]+ orders · page 1 \/ \d+$/)).toBeVisible();
  const firstId = () => page.locator('[data-testid="orders-table"] tbody tr').first().locator('td').first();
  const pageOneFirst = await firstId().textContent();

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/^5 of [\d,]+ orders · page 2 \/ \d+$/)).toBeVisible();
  await expect(firstId()).not.toHaveText(pageOneFirst ?? '');
  await page.getByRole('button', { name: 'Prev' }).click();
  await expect(page.getByText(/page 1 \/ \d+$/)).toBeVisible();

  // The API runs with SIMULATE_ORDERS=true, so a new pending order lands on the stream every few seconds.
  const first = page.locator('[data-testid="card-live-orders"] li').first().locator('.b-live-meta');
  const before = await first.textContent();
  await expect(first).not.toHaveText(before ?? '', { timeout: 20_000 });

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to Harbor Goods' })).toBeVisible();
});

test('range buttons reload data from the API', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('$48,920')).toBeVisible();
  await page.getByRole('button', { name: '7d' }).click();
  await expect(page.getByText('$48,920')).toBeHidden();
  await expect(page.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'true');
});
