import { describe, expect, it } from 'vitest';
import { fogSight } from '../../game/scares/fogSight';
import { main, markers } from './layout';
import { stepsAway } from './scares';
import { distanceToTrails } from './trail';
import { forestAtmosphere } from './woods';

const { fog } = forestAtmosphere.night;
const nightSight = fogSight({ near: fog.near, far: fog.far, density: fog.density ?? 0, wisps: fog.wisps ?? 0 });
const distance = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

describe('night 1 on the forest path', () => {
  it('sets the figures off while the fog still hides them', () => {
    expect(distance(markers.for1_ahead_trigger, markers.for1_ahead)).toBeGreaterThan(nightSight);
    expect(distance(markers.for1_ahead_again_trigger, markers.for1_ahead_again_from)).toBeGreaterThan(nightSight);
  });

  it('stands the first figure on the path and steps it off into the trees', () => {
    expect(distanceToTrails([main], markers.for1_ahead.x, markers.for1_ahead.z)).toBeLessThan(0.1);
    expect(distanceToTrails([main], markers.for1_ahead_exit.x, markers.for1_ahead_exit.z)).toBeGreaterThan(2.5);
  });
});

describe('stepsAway', () => {
  const steps = stepsAway({ x: 0, z: 0 }, { x: 0, z: -20 }, 6);

  it('limps: a longer gap after every heavy step', () => {
    const gaps = steps.slice(1).map((step, i) => step.after! - steps[i]!.after!);
    [1.35, 0.95, 1.35, 0.95, 1.35].forEach((gap, i) => expect(gaps[i]).toBeCloseTo(gap));
  });
});
