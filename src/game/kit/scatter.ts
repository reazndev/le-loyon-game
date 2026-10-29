import { hashString, seededRandom } from '../../engine/random';
import type { TreeSpot } from './builders';

export interface ScatterOptions {
  /** Center and size of the rectangle to fill. */
  x: number;
  z: number;
  w: number;
  d: number;
  count: number;
  /** Same seed, same layout. */
  seed?: string;
  /** Minimum distance between spots, in meters. Default 1.5. */
  spacing?: number;
  /** Return true to keep a spot empty, for paths and clearings. */
  avoid?: (x: number, z: number) => boolean;
  /** Range of random sizes. Default [0.8, 1.25]. */
  scale?: [number, number];
}

/** Random, repeatable spots in a rectangle, spaced apart. Feed the result to `kit.trees`. */
export function scatter(options: ScatterOptions): TreeSpot[] {
  const random = seededRandom(hashString(options.seed ?? 'scatter'));
  const spacing = options.spacing ?? 1.5;
  const [minScale, maxScale] = options.scale ?? [0.8, 1.25];
  const spots: TreeSpot[] = [];
  // Rejection sampling with a cap, so an overfull area returns fewer spots instead of hanging.
  for (let attempt = 0; attempt < options.count * 30 && spots.length < options.count; attempt++) {
    const x = options.x + (random() - 0.5) * options.w;
    const z = options.z + (random() - 0.5) * options.d;
    if (options.avoid?.(x, z)) continue;
    if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < spacing)) continue;
    spots.push({ x, z, scale: minScale + random() * (maxScale - minScale), yaw: random() * 360 });
  }
  return spots;
}
