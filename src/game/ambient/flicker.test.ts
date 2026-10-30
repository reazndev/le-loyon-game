import { describe, expect, it } from 'vitest';
import { flameLevel, tubeLevel } from './flicker';
import { swayAngle } from './sway';
import { puffOpacity } from './breath';
import { nextGap } from './schedule';

const samples = (f: (t: number) => number, seconds: number) => Array.from({ length: seconds * 60 }, (_, i) => f(i / 60));

describe('ambient motion', () => {
  it('keeps a failing tube lit most of the time, with dropouts', () => {
    const levels = samples((t) => tubeLevel(t, 1), 60);
    const dark = levels.filter((k) => k < 0.5).length / levels.length;
    expect(dark).toBeGreaterThan(0.01);
    expect(dark).toBeLessThan(0.15);
  });

  it('keeps a flame between 0.6 and 1.1', () => {
    samples((t) => flameLevel(t, 2), 20).forEach((k) => {
      expect(k).toBeGreaterThan(0.6);
      expect(k).toBeLessThan(1.1);
    });
  });

  it('never swings past the given angle', () => {
    samples((t) => swayAngle(t, 4, 0.3, 1), 30).forEach((a) => expect(Math.abs(a)).toBeLessThanOrEqual(4));
  });

  it('shows a breath only while it lasts', () => {
    expect(puffOpacity(-0.1)).toBe(0);
    expect(puffOpacity(0.25)).toBeGreaterThan(0.5);
    expect(puffOpacity(5)).toBe(0);
  });

  it('spaces events by at least a fifth of the mean', () => {
    expect(nextGap(10, () => 0)).toBeCloseTo(2);
    expect(nextGap(10, () => 0.5)).toBeGreaterThan(2);
  });
});
