import { describe, expect, it } from 'vitest';
import { DRAUGHT_EVERY, lanternLevel } from './lantern';

describe('lanternLevel', () => {
  const samples = Array.from({ length: 2000 }, (_, i) => lanternLevel(i * 0.05, -17.2));

  it('stays between a pulled-low flame and a steady one', () => {
    samples.forEach((k) => {
      expect(k).toBeGreaterThanOrEqual(0.4);
      expect(k).toBeLessThanOrEqual(1.06);
    });
  });

  it('dips low once in each draught period and stands up again', () => {
    const period = Math.round(DRAUGHT_EVERY / 0.05);
    const lows = Array.from({ length: Math.floor(samples.length / period) }, (_, n) => Math.min(...samples.slice(n * period, (n + 1) * period)));
    lows.forEach((low) => expect(low).toBeLessThan(0.65));
    expect(samples.filter((k) => k > 0.8).length).toBeGreaterThan(samples.length * 0.8);
  });
});
