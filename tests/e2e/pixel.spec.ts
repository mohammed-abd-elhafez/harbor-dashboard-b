import { test, expect } from '@playwright/test';
import { platform } from 'node:os';

test.use({
  viewport: { width: 1440, height: 1160 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  locale: 'en-US',
  timezoneId: 'UTC',
  reducedMotion: 'reduce',
});

// The baseline only holds on the pinned Linux Chromium (spec 13.1). Elsewhere use `npm run diff:report`.
test.skip(platform() !== 'linux', 'pixel baseline is Linux-only');

test('pixel parity /', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="orders-table"]');
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  await expect(page).toHaveScreenshot('B-dark-ops-1440x1160.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.0005,
    threshold: 0.1,
    animations: 'disabled',
  });
});
