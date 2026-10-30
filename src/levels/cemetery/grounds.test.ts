import { describe, expect, it } from 'vitest';
import { around, hillHeight } from './grounds';
import { CHASSOT_BEDS, GROUNDS, inside } from './layout';

describe('around', () => {
  it('covers the outer rectangle except the gap', () => {
    const pieces = around(GROUNDS, CHASSOT_BEDS.marc);
    const area = pieces.reduce((sum, r) => sum + r.w * r.d, 0);
    expect(area).toBeCloseTo(GROUNDS.w * GROUNDS.d - CHASSOT_BEDS.marc.w * CHASSOT_BEDS.marc.d, 6);
    expect(pieces.some((r) => inside(r, CHASSOT_BEDS.marc.x, CHASSOT_BEDS.marc.z))).toBe(false);
  });

  it('drops pieces of no size when the gap touches an edge', () => {
    expect(around({ x: 0, z: 0, w: 10, d: 10 }, { x: 0, z: -4, w: 10, d: 2 })).toHaveLength(1);
  });
});

describe('hillHeight', () => {
  it('is level at the walls and falls toward the village', () => {
    expect(hillHeight(0, GROUNDS.d / 2 + 1)).toBeCloseTo(0, 5);
    expect(hillHeight(0, GROUNDS.d / 2 + 25)).toBeLessThan(-1.5);
  });
});
