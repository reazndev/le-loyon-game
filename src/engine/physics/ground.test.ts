import { describe, expect, it } from 'vitest';
import { GroundMap } from './ground';

describe('GroundMap', () => {
  it('falls back when no patch covers the point', () => {
    const ground = new GroundMap();
    ground.fallback = { height: -1, surface: 'snow' };
    expect(ground.sample(5, 5)).toEqual({ height: -1, surface: 'snow' });
  });

  it('returns the highest patch the player can step onto', () => {
    const ground = new GroundMap();
    ground.add({ area: { kind: 'box', x: 0, z: 0, hw: 5, hd: 5, angle: 0 }, heightAt: () => 0, surface: 'stone' });
    ground.add({ area: { kind: 'box', x: 0, z: 0, hw: 1, hd: 1, angle: 0 }, heightAt: () => 0.3, surface: 'wood' });
    ground.add({ area: { kind: 'box', x: 0, z: 0, hw: 1, hd: 1, angle: 0 }, heightAt: () => 2.5, surface: 'stone' });
    expect(ground.sample(0, 0, 0)).toEqual({ height: 0.3, surface: 'wood' });
    expect(ground.sample(3, 0, 0)).toEqual({ height: 0, surface: 'stone' });
  });

  it('samples height functions', () => {
    const ground = new GroundMap();
    ground.add({ area: { kind: 'circle', x: 0, z: 0, r: 10 }, heightAt: (x) => x * 0.1, surface: 'grass' });
    expect(ground.sample(4, 0).height).toBeCloseTo(0.4);
  });
});
