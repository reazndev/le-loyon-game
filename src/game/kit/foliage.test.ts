import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { bareTree, branchCard, cardsGeometry, ivyCover, leafyBeech, leafySpruce, stockTrees, thicket, VERGE_PLANTS } from './foliage';

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

describe('card trees', () => {
  const bounds = (geometry: ReturnType<typeof cardsGeometry>) => {
    geometry.computeBoundingBox();
    return geometry.boundingBox!;
  };

  it('keeps a bare tree\'s limbs inside its painted crown', () => {
    const [limbs, twigs] = bareTree('test', { spread: 1.6 }).parts;
    const [wood, crown] = [bounds(limbs!.geometry), bounds(twigs!.geometry)];
    expect(Math.max(-wood.min.x, wood.max.x, -wood.min.z, wood.max.z)).toBeLessThan(crown.max.x * 1.05);
  });

  it('builds every stock kind from alpha cards', () => {
    (['spruce', 'bare', 'birch'] as const).forEach((kind) => {
      const models = stockTrees(kind);
      expect(models.length).toBeGreaterThan(1);
      models.forEach((model) => expect(model.parts.some((part) => part.cutout)).toBe(true));
    });
  });

  it('makes one part per plant texture in a thicket', () => {
    const textures = new Set(VERGE_PLANTS.map((plant) => plant.texture));
    expect(thicket('test', { length: 2, depth: 1, count: 10, plants: VERGE_PLANTS }).parts.map((part) => part.texture).sort()).toEqual([...textures].sort());
  });

  it('lays ivy just off the wall, in front of its -Z side', () => {
    const box = bounds(ivyCover('test', { w: 3, h: 2 }).parts[0]!.geometry);
    expect(box.min.z).toBeGreaterThan(-0.4);
    expect(box.max.z).toBeLessThan(0.6);
    expect(box.max.x - box.min.x).toBeGreaterThan(2.5);
  });
});
