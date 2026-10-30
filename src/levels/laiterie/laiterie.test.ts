import { describe, expect, it } from 'vitest';
import { laiterieBeats } from './beats';
import { bellStrikes } from './bell';
import { secondHandAngle } from './secondHand';

describe('the shop bell', () => {
  it('bounces several times, quicker and softer, when the door swings open', () => {
    const strikes = bellStrikes(1);
    expect(strikes.length).toBeGreaterThanOrEqual(5);
    strikes.slice(1).forEach((strike, i) => {
      const before = strikes[i]!;
      expect(strike.time).toBeGreaterThan(before.time);
      expect(strike.level).toBeLessThan(before.level);
      if (i > 0) expect(strike.time - before.time).toBeLessThan(before.time - strikes[i - 1]!.time);
    });
  });

  it('gives a draft one faint knock and barely a second', () => {
    const strikes = bellStrikes(0.2);
    expect(strikes.length).toBeLessThanOrEqual(2);
    expect(strikes[0]).toEqual({ time: 0, level: 0.2 });
  });
});

describe('the laiterie beats', () => {
  const ring = () => undefined;

  it('stages the draft bell on day 2 and day 3 only', () => {
    expect(laiterieBeats('day2', ring).map((b) => b.id)).toEqual(['lai_bell_draft']);
    expect(laiterieBeats('day3', ring).map((b) => b.id)).toEqual(['lai_bell_draft']);
    (['day1', 'night1', 'night2', 'night3', 'dawn'] as const).forEach((phase) => expect(laiterieBeats(phase, ring)).toEqual([]));
  });

  it('fires once and remembers it', () => {
    expect(laiterieBeats('day2', ring)[0]).toMatchObject({ set: 'lai_bell_draft' });
  });
});

describe('the second hand', () => {
  it('jumps once a second and comes round in a minute', () => {
    expect(secondHandAngle(0)).toBe(0);
    expect(secondHandAngle(0.9)).toBe(0);
    expect(secondHandAngle(15.2)).toBeCloseTo(Math.PI / 2);
    expect(secondHandAngle(60.5)).toBe(0);
  });
});
