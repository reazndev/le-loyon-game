import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { branchCard, cardsGeometry, leafyBeech, leafySpruce } from './foliage';

const corners = (geometry: ReturnType<typeof cardsGeometry>) => {
  const position = geometry.getAttribute('position');
  return Array.from({ length: position.count }, (_, i) => new Vector3().fromBufferAttribute(position, i));
};

describe('branchCard', () => {
  const root = new Vector3(0, 3, 0);
  const along = new Vector3(1, 0, 0);

  it('reaches from the root out along the branch', () => {
    const card = branchCard({ root, along, length: 2, width: 1, roll: 0, rootAt: 'top', shade: 1 });
    const xs = corners(cardsGeometry([card])).map((p) => p.x);
    expect(Math.min(...xs)).toBeCloseTo(0);
    expect(Math.max(...xs)).toBeCloseTo(2);
  });

  it('puts the named edge of the picture at the root', () => {
    const geometry = cardsGeometry([branchCard({ root, along, length: 2, width: 1, roll: 0, rootAt: 'top', shade: 1 })]);
    const uv = geometry.getAttribute('uv');
    const atRoot = corners(geometry).flatMap((p, i) => (p.x < 0.01 ? [uv.getY(i)] : []));
    expect(atRoot).toEqual([1, 1]);
  });
});

describe('leafy trees', () => {
  it('shades every needle card through a vertex color', () => {
    const needles = leafySpruce('test').parts.find((part) => part.texture === 'branch_spruce')!;
    expect(needles.cutout).toBe(true);
    expect(needles.geometry.getAttribute('color').count).toBe(needles.geometry.getAttribute('position').count);
  });

  it('tips a leaning beech toward +X', () => {
    const middle = (lean: number) => {
      const wood = leafyBeech('test', { lean }).parts[0]!.geometry;
      wood.computeBoundingBox();
      return (wood.boundingBox!.min.x + wood.boundingBox!.max.x) / 2;
    };
    expect(middle(0.4) - middle(0)).toBeGreaterThan(1.5);
  });

  it('is the same tree for the same seed', () => {
    const needles = (seed: string) => Array.from(leafySpruce(seed).parts[1]!.geometry.getAttribute('position').array);
    expect(needles('a')).toEqual(needles('a'));
    expect(needles('a')).not.toEqual(needles('b'));
  });
});
