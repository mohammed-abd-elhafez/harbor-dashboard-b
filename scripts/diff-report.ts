import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// Renders the running preview (port 4173) and diffs it against the reference PNG.
const REF = 'tests/e2e/baselines/B-dark-ops-1440x1160.png';
const OUT = 'tests/e2e/out';

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1160 }, deviceScaleFactor: 1, reducedMotion: 'reduce', timezoneId: 'UTC', locale: 'en-US' });
  await page.goto(process.env.URL ?? 'http://localhost:4173/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="orders-table"]');
  const actualBuf = await page.screenshot({ fullPage: true });
  await browser.close();
  writeFileSync(`${OUT}/actual.png`, actualBuf);

  const expected = PNG.sync.read(readFileSync(REF));
  const actual = PNG.sync.read(actualBuf);
  if (expected.width !== actual.width || expected.height !== actual.height) {
    throw new Error(`Size mismatch: expected ${expected.width}x${expected.height}, got ${actual.width}x${actual.height}`);
  }
  const diff = new PNG({ width: expected.width, height: expected.height });
  const diffPixels = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, { threshold: 0.1 });
  writeFileSync(`${OUT}/diff.png`, PNG.sync.write(diff));

  // Cluster by 40px grid cell to find the largest areas.
  const cells = new Map<string, number>();
  for (let y = 0; y < diff.height; y++) {
    for (let x = 0; x < diff.width; x++) {
      const i = (y * diff.width + x) * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0) {
        const k = `${Math.floor(x / 40) * 40},${Math.floor(y / 40) * 40}`;
        cells.set(k, (cells.get(k) ?? 0) + 1);
      }
    }
  }
  const top = [...cells.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([cell, n]) => ({ cell, pixels: n }));
  const summary = { diffPixels, ratio: diffPixels / (expected.width * expected.height), top };
  writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

void main();
