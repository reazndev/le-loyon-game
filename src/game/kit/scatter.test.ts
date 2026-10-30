import { describe, expect, it } from 'vitest';
import { scatter, spotsAlong } from './scatter';

describe('scatter', () => {
  const options = { x: 0, z: 0, w: 30, d: 30, count: 200, seed: 'test', spacing: 1.5, avoid: (x: number) => Math.abs(x) < 2 };
  const spots = scatter(options);

  it('keeps every pair of spots at least the spacing apart', () => {
    const closest = Math.min(...spots.flatMap((a, i) => spots.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.z - b.z))));
    expect(closest).toBeGreaterThanOrEqual(1.5);
  });

  it('leaves avoided ground empty and stays in the rectangle', () => {
    expect(spots.every((s) => Math.abs(s.x) >= 2 && Math.abs(s.x) <= 15 && Math.abs(s.z) <= 15)).toBe(true);
  });

  it('gives the same layout for the same seed', () => {
    expect(scatter(options)).toEqual(spots);
  });
});

describe('spotsAlong', () => {
  const spots = spotsAlong(
    [
      [0, 0],
      [10, 0],
      [10, 6],
    ],
    { step: 2, seed: 'test' },
  );

  it('spaces spots along each leg of the line', () => {
    expect(spots).toHaveLength(8);
    expect(spots.slice(0, 5).map((s) => s.x)).toEqual([1, 3, 5, 7, 9]);
    expect(spots.slice(5).every((s) => s.x === 10)).toBe(true);
  });

  it('turns each spot so its +X runs along the line', () => {
    expect(Math.abs(spots[0]!.yaw!)).toBeLessThan(5);
    // Along +Z, a quarter turn the other way round Y.
    expect(spots[6]!.yaw!).toBeCloseTo(-90, -1);
  });
});
