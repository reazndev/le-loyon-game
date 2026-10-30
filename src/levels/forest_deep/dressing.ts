import { crows } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { cairn, fallenBranches, rottenStump, wireFence } from '../forest_path/props';
import { beside, distanceToTrails, type Trail } from '../forest_path/trail';
import type { Height } from '../forest_path/woods';

/** Where everything along the animal track stands, worked out from the track itself. */
export function trackProps(track: Trail) {
  const at = (meters: number, side: number) => beside(track, meters, side);
  return {
    /** A short run of fence nobody mends, along the left of the track, its last post down. */
    fence: [24, 27, 30].map((meters) => [at(meters, -2.5).x, at(meters, -2.5).z] as const) as Trail,
    stumps: [
      { ...at(12, 1.8), size: 1.1 },
      { ...at(35, -1.8), size: 0.9 },
    ],
    branches: [
      { ...at(6, -1.7), yaw: 40 },
      { ...at(22, 1.9), yaw: -30 },
      { ...at(40, -1.8), yaw: 80 },
    ],
    cairns: [at(3, -1.6), at(44, 1.5)],
  };
}

/** Where undergrowth would bury the props: tall plants off the fence, any plant off the small things. */
export function keepClear(track: Trail) {
  const { fence, stumps, branches, cairns } = trackProps(track);
  return {
    tall: (x: number, z: number): boolean => distanceToTrails([fence], x, z) < 1.3,
    low: (x: number, z: number): boolean => [...stumps, ...branches, ...cairns].some((p) => Math.hypot(x - p.x, z - p.z) < 1),
  };
}

/**
 * Dresses the track up to the larch. The first cairn stands where the track leaves the fort's
 * thicket; the second, the same size, where it reaches the clearing: someone marked the way.
 * Crows sit on the stumps, a post, and the first cairn by day.
 */
export function dressTrack(kit: LevelKit, ctx: SceneContext, track: Trail, height: Height): void {
  const { fence, stumps, branches, cairns } = trackProps(track);
  const perches = kit.batch((still) => {
    const posts = wireFence(still, ctx, height, fence, 'larch-fence');
    const tops = stumps.map((at, i) => rottenStump(still, at, at.size, `larch-stump-${i}`));
    branches.forEach((at, i) => fallenBranches(still, at, at.yaw, `larch-branches-${i}`));
    const marks = cairns.map((at, i) => cairn(still, at, `larch-cairn-${i}`));
    // The log beside the track, from `index.ts`, halfway along.
    const log = { x: 5.93, z: 18, y: 0.38 };
    return [...tops, posts[0]!, marks[0]!, log];
  });
  if (ctx.state.time === 'day') crows(kit, ctx, perches);
}
