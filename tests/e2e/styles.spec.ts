import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1160 } });

test('computed styles match the design tokens (spec 13.4)', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="orders-table"]');

  const s = await page.evaluate(() => {
    const cs = (sel: string) => getComputedStyle(document.querySelector(sel)!);
    return {
      root: cs('.b-root').backgroundColor,
      h1: { size: cs('h1').fontSize, weight: cs('h1').fontWeight, family: cs('h1').fontFamily },
      kpi: { size: cs('.b-kpi-value').fontSize, family: cs('.b-kpi-value').fontFamily },
      active: cs('.b-range-btn[aria-pressed="true"]').backgroundColor,
      card: cs('[data-testid="card-orders"]').backgroundColor,
    };
  });
  expect(s.root).toBe('rgb(11, 15, 20)');
  expect(s.h1.size).toBe('26px');
  expect(s.h1.weight).toBe('700');
  expect(s.h1.family.startsWith('"IBM Plex Sans"') || s.h1.family.startsWith('IBM Plex Sans')).toBe(true);
  expect(s.kpi.size).toBe('34px');
  expect(s.kpi.family.replace(/"/g, '').startsWith('IBM Plex Mono')).toBe(true);
  expect(s.active).toBe('rgb(245, 181, 68)');
  expect(s.card).toBe('rgb(17, 24, 32)');
});

test('every font face in spec 5.3 is loaded', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="orders-table"]');
  // Faces load lazily on first use, so request each one explicitly before inspecting.
  await page.evaluate(() =>
    Promise.all(
      ['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 16px "IBM Plex Sans"`)).concat(
        ['400', '500', '600'].map((w) => document.fonts.load(`${w} 16px "IBM Plex Mono"`)),
      ),
    ),
  );
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight}`),
  );
  for (const face of [
    'IBM Plex Sans 400', 'IBM Plex Sans 500', 'IBM Plex Sans 600', 'IBM Plex Sans 700',
    'IBM Plex Mono 400', 'IBM Plex Mono 500', 'IBM Plex Mono 600',
  ]) {
    expect(loaded, face).toContain(face);
  }
});
