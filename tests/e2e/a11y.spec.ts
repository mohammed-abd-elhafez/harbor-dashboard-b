import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1160 } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="orders-table"]');
});

test('every visible button and link meets the 44px target size', async ({ page }) => {
  const failures = await page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll<HTMLElement>('button, a[href]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return; // visually hidden (skip link until focused)
      const iconOnly = !el.textContent?.trim();
      if (r.height < 44 || (iconOnly && r.width < 44)) {
        out.push(`${el.getAttribute('aria-label') ?? el.textContent} ${r.width}x${r.height}`);
      }
    });
    // Inputs are measured through the 44px wrapper that holds the icon and the field.
    document.querySelectorAll<HTMLElement>('input').forEach((el) => {
      const r = (el.parentElement ?? el).getBoundingClientRect();
      if (r.height < 44) out.push(`input wrapper ${r.height}`);
    });
    return out;
  });
  expect(failures).toEqual([]);
});

test('keyboard: skip link first, every stop shows a focus indicator', async ({ page }) => {
  const stops: { name: string; shown: boolean }[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const own = getComputedStyle(el).outlineStyle !== 'none';
      // The search field shows its ring on the wrapper (spec 10.1).
      const wrapper = el.parentElement ? getComputedStyle(el.parentElement).outlineStyle !== 'none' : false;
      return { name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName, shown: own || wrapper };
    });
    if (!stop) break;
    stops.push(stop);
  }
  expect(stops[0]?.name).toBe('Skip to main content');
  expect(stops.length).toBeGreaterThan(10);
  expect(stops.filter((s) => !s.shown)).toEqual([]);
});

test('text contrast meets WCAG AA', async ({ page }) => {
  const failures = await page.evaluate(() => {
    const parse = (c: string): [number, number, number, number] => {
      const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
      return [m[0] ?? 0, m[1] ?? 0, m[2] ?? 0, m[3] ?? 1];
    };
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    const bgOf = (el: Element | null): number[] => {
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c[3] > 0.99) return c;
      }
      return [11, 15, 20, 1];
    };
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim()) continue;
      const el = n.parentElement;
      if (!el) continue;
      const box = el.getBoundingClientRect();
      if (box.width <= 1 || box.height <= 1) continue;
      const cs = getComputedStyle(el);
      const color = el instanceof SVGElement ? parse(getComputedStyle(el).fill) : parse(cs.color);
      const l1 = lum(color);
      const l2 = lum(bgOf(el));
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) out.push(`"${n.textContent.trim().slice(0, 24)}" ${ratio.toFixed(2)}`);
    }
    return out;
  });
  expect(failures).toEqual([]);
});
