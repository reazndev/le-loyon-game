import { describe, expect, it } from 'vitest';
import { main } from './layout';
import { edgeStoneSpots } from './stones';
import { distanceToTrails } from './trail';

describe('edgeStoneSpots', () => {
  const stones = edgeStoneSpots(main, 1.7, 'test');

  it('lines the edges and leaves the trail itself clear', () => {
    stones.forEach((s) => {
      const d = distanceToTrails([main], s.x, s.z);
      expect(d).toBeGreaterThan(0.85);
      expect(d).toBeLessThan(1.5);
    });
  });

  it('puts one within a few steps all along', () => {
    expect(stones.length).toBeGreaterThan(20);
  });

  it('lays the same stones every time', () => {
    expect(edgeStoneSpots(main, 1.7, 'test')).toEqual(stones);
  });
});
