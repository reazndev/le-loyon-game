import { describe, expect, it } from 'vitest';
import { easePose } from './facing';

describe('easePose', () => {
  const from = { x: 0, z: 0, yaw: 170 };
  const to = { x: 2, z: -1, yaw: -170 };

  it('starts at the first pose and ends at the second', () => {
    expect(easePose(from, to, 0)).toEqual(from);
    const end = easePose(from, to, 1);
    expect(end.x).toBeCloseTo(2);
    expect(end.z).toBeCloseTo(-1);
    expect(end.yaw).toBeCloseTo(190);
  });

  it('turns the short way round', () => {
    expect(easePose(from, to, 0.5).yaw).toBeCloseTo(180);
  });
});
