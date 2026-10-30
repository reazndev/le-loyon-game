import { describe, expect, it } from 'vitest';
import { CROWN_RADIUS, LARCH_HEIGHT, larchBranches, needleCards } from './larch';

describe('larchBranches', () => {
  const branches = larchBranches('test');

  it('keeps the trunk bare up to head height and stays under the top', () => {
    branches.forEach((b) => {
      expect(b.y).toBeGreaterThan(2.2);
      expect(b.y).toBeLessThan(LARCH_HEIGHT - 1);
    });
  });

  it('narrows to a spire', () => {
    const third = Math.floor(branches.length / 3);
    const mean = (bs: typeof branches) => bs.reduce((sum, b) => sum + b.length, 0) / bs.length;
    expect(mean(branches.slice(0, third))).toBeGreaterThan(2 * mean(branches.slice(-third)));
  });
});

describe('needleCards', () => {
  const cards = needleCards(larchBranches('test'), 'test');

  it('fills the crown with large clumps', () => {
    expect(cards.length).toBeGreaterThan(200);
    expect(Math.max(...cards.map((c) => c.size))).toBeGreaterThan(1.8);
  });

  it('keeps every clump within the crown and off the ground', () => {
    cards.forEach((c) => {
      expect(Math.hypot(c.x, c.z)).toBeLessThan(CROWN_RADIUS);
      expect(c.y - c.size / 2).toBeGreaterThan(0.2);
    });
  });
});
