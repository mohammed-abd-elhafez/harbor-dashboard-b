import { describe, expect, it } from 'vitest';
import { buildDonutSegments, chartAriaLabel, computePoints, samplePoints, toPolyline } from '../../src/domain/chart-math';
import { overview30d } from '../../src/data/fixtures';

describe('computePoints (spec 7.2)', () => {
  it('reproduces the exact 30d point list', () => {
    expect(toPolyline(computePoints(overview30d.revenueSeries.points))).toBe(
      '48,114 89,99 130,121 171,85 212,70 253,92 294,106 335,78 376,56 417,63 458,85 499,70 540,42 581,63 623,49 664,34',
    );
  });
  it('samples long series down to 16 points', () => {
    const long = Array.from({ length: 31 }, (_, i) => ({ label: `d${i}`, value: i * 10 }));
    const out = samplePoints(long);
    expect(out).toHaveLength(16);
    expect(out[0]?.label).toBe('d0');
    expect(out[15]?.label).toBe('d30');
  });
  it('builds the aria label from data', () => {
    expect(chartAriaLabel(overview30d.revenueSeries.points)).toBe(
      'Line chart of daily revenue from Oct 1 to Oct 31, rising from about 1.2 thousand dollars to 2.3 thousand dollars',
    );
  });
});

describe('buildDonutSegments (spec 7.4)', () => {
  it('reproduces the segment table', () => {
    const segs = buildDonutSegments(overview30d.traffic).map((s) => [s.len, s.offset, s.color]);
    expect(segs).toEqual([
      [95.5, 0, '#F5B544'],
      [67.9, -95.5, '#6CB6FF'],
      [52.8, -163.4, '#3DD68C'],
      [35.2, -216.2, '#93A1B0'],
    ]);
  });
});

describe("computePoints with a narrower plot (spec 12)", () => {
  it("spreads x evenly to the given right edge", () => {
    const xy = computePoints(overview30d.revenueSeries.points, undefined, 400);
    expect(xy[0]?.x).toBe(48);
    expect(xy[15]?.x).toBe(400);
  });
});
