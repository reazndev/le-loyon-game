import { describe, expect, it } from 'vitest';
import { forestAtmosphere } from './woods';
import { fogSight } from './fogFigure';

describe('fogSight', () => {
  it('hides a figure just past the torch beam at night', () => {
    const { fog } = forestAtmosphere.night;
    const sight = fogSight({ near: fog.near, far: fog.far, density: fog.density ?? 0, wisps: fog.wisps ?? 0 });
    expect(sight).toBeGreaterThan(10);
    expect(sight).toBeLessThan(12.5);
  });

  it('follows the thicker of the ramp and the falloff', () => {
    expect(fogSight({ near: 0, far: 20, density: 0, wisps: 0 })).toBeCloseTo(19);
    expect(fogSight({ near: 0, far: 100, density: 0.2, wisps: 0 })).toBeCloseTo(Math.sqrt(-Math.log(0.05)) / 0.2);
  });

  it('reaches further when wisps thin the fog in patches', () => {
    const base = { near: 1, far: 15, density: 0.09 };
    expect(fogSight({ ...base, wisps: 0.5 })).toBeGreaterThan(fogSight({ ...base, wisps: 0 }));
  });
});
