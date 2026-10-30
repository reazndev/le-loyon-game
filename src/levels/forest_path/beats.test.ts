import { describe, expect, it } from 'vitest';
import { lookPoint } from './beats';

describe('lookPoint', () => {
  const marker = { beat: 'x', x: 2, z: -3, yaw: 0, note: '' };
  const ground = (x: number, z: number) => x - z;

  it('stands the point on the ground under the marker', () => {
    expect(lookPoint({ ...marker, y: 0.4 }, ground)).toEqual({ x: 2, z: -3, y: 5.4 });
  });

  it('defaults to eye height, and takes an explicit height over the marker', () => {
    expect(lookPoint(marker, ground).y).toBe(6.5);
    expect(lookPoint({ ...marker, y: 0.4 }, ground, 0.6).y).toBe(5.6);
  });
});
