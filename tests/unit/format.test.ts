import { describe, expect, it } from 'vitest';
import { axisK, int, pct2, signedPct1, signedPt1, tooltipK, usd0, usd2 } from '../../src/domain/format';

describe('formatters (spec 7.1)', () => {
  it('usd0', () => expect(usd0(48920)).toBe('$48,920'));
  it('usd2', () => {
    expect(usd2(38.1)).toBe('$38.10');
    expect(usd2(112.2)).toBe('$112.20');
  });
  it('int', () => expect(int(1284)).toBe('1,284'));
  it('pct2', () => expect(pct2(3.42)).toBe('3.42%'));
  it('signedPct1 uses + and U+2212', () => {
    expect(signedPct1(12.4, 'up')).toBe('+12.4%');
    expect(signedPct1(2.3, 'down')).toBe('−2.3%');
  });
  it('signedPt1', () => {
    expect(signedPt1(0.4, 'up')).toBe('+0.4 pt');
    expect(signedPt1(0.4, 'down')).toBe('−0.4 pt');
  });
  it('axisK', () => {
    expect(axisK(0)).toBe('$0');
    expect(axisK(1000)).toBe('$1k');
    expect(axisK(2000)).toBe('$2k');
  });
  it('tooltipK', () => expect(tooltipK(2300)).toBe('$2.3k'));
});
