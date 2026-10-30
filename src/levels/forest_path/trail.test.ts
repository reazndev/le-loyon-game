import { describe, expect, it } from 'vitest';
import { distanceToTrails, nearestOnTrails, pointAlong, resample, yawToward, type Trail } from './trail';

const bend: Trail = [
  [0, 0],
  [0, -10],
  [10, -10],
];

describe('nearestOnTrails', () => {
  it('finds the closest point on the closest segment', () => {
    const point = nearestOnTrails([bend], 3, -4);
    expect(point.x).toBeCloseTo(0);
    expect(point.z).toBeCloseTo(-4);
    expect(point.distance).toBeCloseTo(3);
    expect([point.dx, point.dz]).toEqual([0, -1]);
  });

  it('clamps to the ends', () => {
    expect(distanceToTrails([bend], 0, 5)).toBeCloseTo(5);
  });

  it('picks the nearest of several trails', () => {
    const other: Trail = [
      [20, 0],
      [20, -10],
    ];
    expect(nearestOnTrails([bend, other], 19, -2).x).toBeCloseTo(20);
  });
});

describe('resample', () => {
  it('spaces points along the whole trail without repeating corners', () => {
    const points = resample(bend, 5);
    expect(points.map((p) => p.along)).toEqual([0, 5, 10, 15, 20]);
    expect(points[2]).toMatchObject({ x: 0, z: -10 });
  });
});

describe('pointAlong', () => {
  it('walks past corners', () => {
    expect(pointAlong(bend, 15)).toMatchObject({ x: 5, z: -10, dx: 1, dz: 0 });
  });
});

describe('yawToward', () => {
  it('follows the level yaw convention', () => {
    expect(yawToward(0, -1)).toBeCloseTo(0);
    expect(yawToward(-1, 0)).toBeCloseTo(90);
    expect(yawToward(1, 0)).toBeCloseTo(-90);
    expect(Math.abs(yawToward(0, 1))).toBeCloseTo(180);
  });
});
