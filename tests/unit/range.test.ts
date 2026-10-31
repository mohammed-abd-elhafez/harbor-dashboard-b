import { describe, expect, it } from 'vitest';
import { parseRange } from '../../src/domain/range';

describe('parseRange (spec 4.5)', () => {
  it('accepts valid values', () => {
    for (const r of ['24h', '7d', '30d', '90d'] as const) expect(parseRange(`?range=${r}`)).toBe(r);
  });
  it('falls back to 30d', () => {
    expect(parseRange('')).toBe('30d');
    expect(parseRange('?range=1y')).toBe('30d');
    expect(parseRange('?range=')).toBe('30d');
  });
});
