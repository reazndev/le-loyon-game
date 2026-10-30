import { describe, expect, it } from 'vitest';
import { lampLevel } from './lampLevel';

const samples = (seconds: number, seed = 0) => Array.from({ length: seconds * 20 }, (_, i) => lampLevel(i / 20, seed));

describe('lampLevel', () => {
  it('stays between dark and full', () => {
    samples(300).forEach((k) => {
      expect(k).toBeGreaterThanOrEqual(0);
      expect(k).toBeLessThanOrEqual(1);
    });
  });

  it('burns steady most of the time', () => {
    const steady = samples(300).filter((k) => k > 0.9).length / (300 * 20);
    expect(steady).toBeGreaterThan(0.85);
  });

  it('is lit on arrival and goes out about forty seconds in', () => {
    expect(samples(30).every((k) => k > 0.25)).toBe(true);
    expect(lampLevel(42)).toBeLessThan(0.1);
  });

  it('strikes again slowly rather than snapping back', () => {
    const out = 41 + 2.4;
    expect(lampLevel(out + 0.5)).toBeLessThan(lampLevel(out + 2));
    expect(lampLevel(out + 2)).toBeLessThan(0.9);
  });
});
