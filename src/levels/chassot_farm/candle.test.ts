import { describe, expect, it } from 'vitest';
import { candleAlong, gapGlow } from './candle';

describe('gapGlow', () => {
  it('is brightest with the candle right behind the window and dark beyond reach', () => {
    expect(gapGlow(0)).toBe(1);
    expect(gapGlow(0.8)).toBeGreaterThan(0);
    expect(gapGlow(0.8)).toBeLessThan(1);
    expect(gapGlow(-2)).toBe(0);
  });
});

describe('candleAlong', () => {
  it('walks from one end of the wall to the other and back, pausing at each end', () => {
    expect(candleAlong(0, 3)).toBe(-3);
    expect(candleAlong(1, 3)).toBe(-3);
    expect(candleAlong(13, 3)).toBe(3);
    expect(candleAlong(6.5, 3)).toBeCloseTo(0, 5);
    expect(candleAlong(26, 3)).toBe(-3);
  });
});
