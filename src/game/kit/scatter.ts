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
  // Spots filed by grid cell one spacing wide, so each check looks at nine cells, not every spot.
  const grid = new Map<string, TreeSpot[]>();
  const cell = (v: number) => Math.floor(v / spacing);
  const crowded = (x: number, z: number) => {
    for (let i = cell(x) - 1; i <= cell(x) + 1; i++)
      for (let k = cell(z) - 1; k <= cell(z) + 1; k++) if (grid.get(`${i},${k}`)?.some((s) => Math.hypot(s.x - x, s.z - z) < spacing)) return true;
    return false;
  };
  // Rejection sampling with a cap, so an overfull area returns fewer spots instead of hanging.
  for (let attempt = 0; attempt < options.count * 30 && spots.length < options.count; attempt++) {
    const x = options.x + (random() - 0.5) * options.w;
    const z = options.z + (random() - 0.5) * options.d;
    if (options.avoid?.(x, z)) continue;
    if (crowded(x, z)) continue;
    const spot = { x, z, scale: minScale + random() * (maxScale - minScale), yaw: random() * 360 };
    spots.push(spot);
    const key = `${cell(x)},${cell(z)}`;
    grid.set(key, [...(grid.get(key) ?? []), spot]);
  }
  return spots;
}
