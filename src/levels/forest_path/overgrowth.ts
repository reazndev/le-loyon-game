import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import { distanceToTrails, pointAlong, type Trail } from './trail';
import { billboards, lowPlants, tallPlants, type Billboard } from './woods';

/** A stretch of trail gone wild, `from` to `to` meters along it. */
export interface Overgrown {
  trail: Trail;
  from: number;
  to: number;
}

/** How far from the trail's middle the thicket reaches. */
const REACH = 4;
/** The worn line down the middle that stays clear, so the way on still reads. */
const WORN = 0.3;
/** Tall plants stop this far from the middle; they lean over the path, not across it. */
const TALL_FROM = 0.85;

/**
 * Stretches where the trail is barely kept open: bramble and undergrowth crowd right to its edge,
 * and ferns and grass grow over it, leaving only a worn line down the middle. Plants don't block,
 * so the reporter pushes through.
 */
export function overgrowth(kit: LevelKit, stretches: readonly Overgrown[], options: { seed: string; avoid: (x: number, z: number) => boolean }): void {
  const samples = stretches.flatMap(({ trail, from, to }) => Array.from({ length: Math.ceil(to - from) + 1 }, (_, i) => pointAlong(trail, from + i)));
  const trails = stretches.map((stretch) => stretch.trail);
  const inside = (x: number, z: number) => samples.some((p) => Math.hypot(p.x - x, p.z - z) < REACH);
  const xs = samples.map((p) => p.x);
  const zs = samples.map((p) => p.z);
  const [x0, x1, z0, z1] = [Math.min(...xs) - REACH, Math.max(...xs) + REACH, Math.min(...zs) - REACH, Math.max(...zs) + REACH];
  const bounds = { x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
  const length = stretches.reduce((sum, { from, to }) => sum + to - from, 0);
  const plant = (seed: string, mix: readonly Billboard[], count: number, spacing: number, near: number, far: number) => {
    const spots = scatter({
      ...bounds,
      count,
      seed: `${options.seed}-${seed}`,
      spacing,
      scale: [0.75, 1.3],
      avoid: (x, z) => {
        const d = distanceToTrails(trails, x, z);
        return d < near || d > far || !inside(x, z) || options.avoid(x, z);
      },
    });
    mix.forEach((kind, i) => billboards(kit, kind, spots.filter((_, k) => k % mix.length === i)));
  };
  plant('thicket', tallPlants, length * 14, 0.6, TALL_FROM, REACH);
  plant('over', lowPlants, length * 10, 0.42, WORN, 1.6);
}
