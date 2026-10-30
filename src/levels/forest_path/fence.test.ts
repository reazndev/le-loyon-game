import { describe, expect, it } from 'vitest';
import { alongPost, fencePosts, sagging, wireGeometry } from './fence';

describe('fencePosts', () => {
  const line = [
    [0, 0],
    [10, 0],
    [10, 5],
  ] as const;
  const posts = fencePosts(line, 2.5, 'test');

  it('starts and ends on the line with posts about a step apart', () => {
    expect(posts[0]).toMatchObject({ x: 0, z: 0 });
    expect(posts[posts.length - 1]).toMatchObject({ x: 10, z: 5 });
    posts.slice(1).forEach((p, i) => expect(Math.hypot(p.x - posts[i]!.x, p.z - posts[i]!.z)).toBeLessThanOrEqual(2.5 * 1.25));
  });

  it('has only the last post down', () => {
    expect(posts.filter((p) => p.fallen)).toEqual([posts[posts.length - 1]]);
  });

  it('leans each post a little and gives the same fence for the same seed', () => {
    posts.forEach((p) => [p.lean.x, p.lean.z].forEach((a) => expect(Math.abs(a)).toBeLessThan(0.2)));
    expect(fencePosts(line, 2.5, 'test')).toEqual(posts);
  });
});

describe('alongPost', () => {
  it('rises straight up an upright post and drifts sideways on a leaning one', () => {
    const upright = { x: 0, z: 0, lean: { x: 0, z: 0 }, fallen: false };
    expect(alongPost(upright, [1, 2, 3], 1)).toEqual([1, 3, 3]);
    const top = alongPost({ ...upright, lean: { x: 0, z: 0.2 } }, [0, 0, 0], 1);
    expect(top[0]).toBeLessThan(0);
    expect(top[1]).toBeLessThan(1);
  });
});

describe('sagging', () => {
  it('runs end to end and hangs lowest in the middle', () => {
    const wire = sagging([0, 1, 0], [4, 1, 0], 0.1);
    expect(wire[0]).toEqual([0, 1, 0]);
    expect(wire[wire.length - 1]).toEqual([4, 1, 0]);
    expect(wire[2]![1]).toBeCloseTo(0.9);
    expect(wire[1]![1]).toBeGreaterThan(wire[2]![1]);
  });
});

describe('wireGeometry', () => {
  it('spans the wire it was given', () => {
    const geometry = wireGeometry([[[0, 1, 0], [3, 1, 0]]], 0.02, 0.5);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.min.x).toBeCloseTo(0, 3);
    expect(geometry.boundingBox!.max.x).toBeCloseTo(3, 3);
  });
});
