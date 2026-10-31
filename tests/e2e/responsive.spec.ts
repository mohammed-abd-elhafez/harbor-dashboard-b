import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const WIDTHS = [1440, 1024, 768, 390] as const;

for (const width of WIDTHS) {
  test.describe(`width ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('no horizontal page scroll, axe clean, screenshot', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector('[data-testid="orders-table"]');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
      await page.screenshot({ path: `docs/responsive/${width}.png`, fullPage: true });
    });
  });
}

test.describe('below 1280', () => {
  test.use({ viewport: { width: 768, height: 900 } });

  test('drawer opens, traps focus, closes on Escape', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="orders-table"]');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('chart labels keep native size', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="revenue-chart-svg"]');
    const scale = await page.getByTestId('revenue-chart-svg').evaluate((el) => {
      const svg = el as unknown as SVGSVGElement;
      return svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    });
    expect(scale).toBeCloseTo(1, 1);
  });
});
