import { IcosahedronGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hashString, seededRandom } from '../../engine/random';
import type { LevelKit } from '../../game/kit/levelKit';
import { resample, type Trail } from './trail';
import type { Height } from './woods';

export interface EdgeStone {
  x: number;
  z: number;
  /** Rough radius in meters. */
  size: number;
}

/**
 * Pale fieldstones kicked to the sides of a trail, one every meter or so, now left, now
 * right. At night they are what the torch picks out, so the player can follow the trail's edge.
 */
export function edgeStoneSpots(trail: Trail, width: number, seed: string): EdgeStone[] {
  const random = seededRandom(hashString(seed));
  return resample(trail, 0.9)
    .slice(1)
    .flatMap((p, i, points) => {
      if (random() < 0.3) return [];
      const next = points[Math.min(points.length - 1, i + 1)]!;
      const prev = points[Math.max(0, i - 1)]!;
      const length = Math.hypot(next.x - prev.x, next.z - prev.z) || 1;
      const [lx, lz] = [-(next.z - prev.z) / length, (next.x - prev.x) / length];
      const side = random() < 0.5 ? -1 : 1;
      const out = width / 2 + 0.2 + random() * 0.3;
      return [{ x: p.x + lx * out * side, z: p.z + lz * out * side, size: 0.2 + random() * 0.14 }];
    });
}

/** The stones as one mesh of flattened, pale lumps sitting in the ground. */
export function edgeStones(kit: LevelKit, trail: Trail, width: number, height: Height, seed: string): void {
  const stones = edgeStoneSpots(trail, width, seed).map((s, i) =>
    new IcosahedronGeometry(s.size, 0)
      .scale(1, 0.65, 0.8)
      .rotateY(i * 1.7)
      .translate(s.x, height(s.x, s.z) + s.size * 0.25, s.z)
      .toNonIndexed(),
  );
  kit.mesh(mergeGeometries(stones)!).texture('church_stone', { tile: 0.6 }).color(0xd0ccc0);
}
