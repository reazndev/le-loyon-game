import { describe, expect, it } from 'vitest';
import { LARCH_HEIGHT, larchBranches } from './larch';

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

  it('droops every limb', () => {
    branches.forEach((b) => expect(b.droop).toBeGreaterThan(0.4));
  });
});
