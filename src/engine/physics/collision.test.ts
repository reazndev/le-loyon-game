import { describe, expect, it } from 'vitest';
import { CollisionWorld, containsPoint, pushOut, type BoxShape, type Vec2 } from './collision';

const box = (x: number, z: number, hw: number, hd: number, angleDeg = 0): BoxShape => ({
  kind: 'box',
  x,
  z,
  hw,
  hd,
  angle: (angleDeg * Math.PI) / 180,
});

function expectNear(actual: Vec2, expected: Vec2): void {
  expect(actual.x).toBeCloseTo(expected.x, 9);
  expect(actual.z).toBeCloseTo(expected.z, 9);
}

describe('pushOut', () => {
  it('returns null when the circle does not touch the box', () => {
    expect(pushOut(box(0, 0, 1, 1), 2, 0, 0.3)).toBeNull();
  });

  it('pushes a circle out of a box face', () => {
    const push = pushOut(box(0, 0, 1, 1), 1.2, 0, 0.3)!;
    expect(push.x).toBeCloseTo(0.1);
    expect(push.z).toBeCloseTo(0);
  });

  it('pushes a circle whose center is inside a box out the nearest side', () => {
    const push = pushOut(box(0, 0, 1, 2), 0.8, 0, 0.3)!;
    expect(push.x).toBeCloseTo(0.5);
    expect(push.z).toBeCloseTo(0);
  });

  it('handles rotated boxes', () => {
    // A thin wall along local X, turned 90 degrees so it runs along world Z.
    const wall = box(0, 0, 2, 0.1, 90);
    expect(containsPoint(wall, 0, 1.5)).toBe(true);
    expect(containsPoint(wall, 1.5, 0)).toBe(false);
    const push = pushOut(wall, 0.3, 1, 0.3)!;
    expect(push.x).toBeCloseTo(0.1);
    expect(push.z).toBeCloseTo(0);
  });

  it('pushes out of circles', () => {
    const push = pushOut({ kind: 'circle', x: 0, z: 0, r: 0.5 }, 0, 0.6, 0.3)!;
    expect(push.x).toBeCloseTo(0);
    expect(push.z).toBeCloseTo(0.2);
  });
});

describe('CollisionWorld.move', () => {
  it('moves freely in open space', () => {
    const world = new CollisionWorld();
    expectNear(world.move({ x: 0, z: 0 }, { x: 1, z: 2 }, 0.3), { x: 1, z: 2 });
  });

  it('stops at a wall and slides along it', () => {
    const world = new CollisionWorld();
    world.add(box(0, -2, 5, 0.25));
    // Walk diagonally into the wall at z = -2. Z stops at the wall face, X keeps going.
    const end = world.move({ x: 0, z: 0 }, { x: 1, z: -3 }, 0.3);
    expect(end.z).toBeCloseTo(-2 + 0.25 + 0.3, 5);
    expect(end.x).toBeCloseTo(1, 5);
  });

  it('does not tunnel through a thin wall on a long move', () => {
    const world = new CollisionWorld();
    world.add(box(0, -1, 5, 0.05));
    const end = world.move({ x: 0, z: 0 }, { x: 0, z: -10 }, 0.3);
    expect(end.z).toBeGreaterThan(-1);
  });

  it('settles in a corner between two walls', () => {
    const world = new CollisionWorld();
    world.add(box(0, -1, 3, 0.1));
    world.add(box(-1, 0, 0.1, 3));
    const end = world.move({ x: 0, z: 0 }, { x: -2, z: -2 }, 0.3);
    expect(end.x).toBeCloseTo(-1 + 0.1 + 0.3, 5);
    expect(end.z).toBeCloseTo(-1 + 0.1 + 0.3, 5);
  });

  it('forgets removed shapes', () => {
    const world = new CollisionWorld();
    const remove = world.add(box(0, -1, 5, 0.1));
    remove();
    expectNear(world.move({ x: 0, z: 0 }, { x: 0, z: -3 }, 0.3), { x: 0, z: -3 });
  });
});
