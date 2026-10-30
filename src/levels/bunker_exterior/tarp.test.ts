import { describe, expect, it } from 'vitest';
import { drape, tarpGeometry, type Heap } from './tarp';

const heap: Heap = { w: 1.2, d: 0.8, h: 0.6, skirt: 0.3 };

describe('drape', () => {
  it('lies over the top of the heap', () => {
    expect(drape(heap, 0.1, 0.1)).toBeCloseTo(0.6, 1);
  });

  it('falls toward the ground across the skirt and lies flat past it', () => {
    const across = [0.6, 0.7, 0.8, 0.9].map((x) => drape(heap, x, 0));
    across.slice(1).forEach((h, i) => expect(h).toBeLessThan(across[i]!));
    expect(drape(heap, 0.6 + heap.skirt, 0)).toBeCloseTo(0.02);
  });
});

describe('tarpGeometry', () => {
  it('covers the heap and its skirt, never below the ground', () => {
    const geometry = tarpGeometry(heap);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(box.max.x - box.min.x).toBeCloseTo(heap.w + 2 * heap.skirt);
    expect(box.min.y).toBeGreaterThanOrEqual(0.02 - 1e-6);
  });
});
