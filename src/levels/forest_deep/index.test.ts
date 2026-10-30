import { describe, expect, it } from 'vitest';
import { fogSight } from '../forest_path/fogFigure';
import { distanceToTrails } from '../forest_path/trail';
import { forestAtmosphere } from '../forest_path/woods';
import { markers, track, watchedFrom } from './index';

const { fog } = forestAtmosphere.day;
const daySight = fogSight({ near: fog.near, far: fog.far, density: fog.density ?? 0, wisps: fog.wisps ?? 0 });
const distance = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

describe('for3_watched', () => {
  const figures = [
    { trigger: markers.for3_watched_trigger_1, figure: markers.for3_watched_1, seenFrom: watchedFrom[0] },
    { trigger: markers.for3_watched_trigger_2, figure: markers.for3_watched_2, seenFrom: watchedFrom[1] },
  ];

  it('stands between the trunks, off the track', () => {
    figures.forEach(({ figure }) => expect(distanceToTrails([track], figure.x, figure.z)).toBeGreaterThan(4));
  });

  it('is set off while the fog still hides it', () => {
    figures.forEach(({ trigger, figure }) => expect(distance(trigger, figure)).toBeGreaterThan(daySight));
  });

  it('comes out of the fog further down the track', () => {
    figures.forEach(({ seenFrom, figure }) => expect(distance(seenFrom, figure)).toBeLessThan(13));
  });
});
