import { crows } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { height, main, toFort, toStream } from './layout';
import { branchDrips, cairn, fallenBranches, huntersHide, plasticBag, privateSign, rottenStump, wireFence } from './props';
import { beside, distanceToTrails, nearestOnTrails, pointAlong, type Trail } from './trail';

/** An old fence along the east side of the path, a step off it, gone at its lower end. */
const fence: Trail = [7, 9, 11, 13, 14.5].map((meters) => {
  const p = beside(main, meters, -2.5);
  return [p.x, p.z] as const;
});
const HIDE = { x: -4.7, z: 15.8 };
const stumps = (
  [
    [main, 4, -1.8, 1.1],
    [main, 22.5, 1.9, 0.9],
    [toFort, 24, -1.8, 1],
    [toStream, 14, 1.9, 1.2],
  ] as const
).map(([trail, meters, side, size]) => ({ ...beside(trail, meters, side), size }));
const branches = (
  [
    [main, 6.5, 1.7, 30],
    [main, 17, -1.9, 100],
    [main, 29, 1.8, -20],
    [toFort, 12, 1.9, 70],
    [toStream, 29, -1.8, 10],
  ] as const
).map(([trail, meters, side, yaw]) => ({ ...beside(trail, meters, side), yaw }));
const CAIRN = beside(toStream, 16.4, -1.6);
const BAG = beside(toStream, 11, -2.4);

/** Where undergrowth would bury the props: tall plants off the fence and the hide, any plant off the small things. */
export const keepClear = {
  tall: (x: number, z: number): boolean => distanceToTrails([fence], x, z) < 1.3 || Math.hypot(x - HIDE.x, z - HIDE.z) < 2.2,
  low: (x: number, z: number): boolean => [...stumps, ...branches, CAIRN].some((p) => Math.hypot(x - p.x, z - p.z) < 1),
};

/**
 * What people left along the path, all of it old: a hunter's hide watching the trail, a fence
 * with a private-property sign, a cairn by the stream, a bag in the brambles, stumps and dead
 * wood at the trail's edge. Crows sit on some of it by day; on wet nights the branches over the
 * path drip.
 */
export function dressPath(kit: LevelKit, ctx: SceneContext): void {
  const perches = kit.batch((still) => {
    const watching = huntersHide(still, ctx, HIDE, nearestOnTrails([main], HIDE.x, HIDE.z));
    const posts = wireFence(still, ctx, height, fence, 'forest-path-fence');
    privateSign(still, beside(main, 8, -2.1), pointAlong(main, 5));
    const stumpTops = stumps.map((at, i) => rottenStump(still, at, at.size, `forest-path-stump-${i}`));
    branches.forEach((at, i) => fallenBranches(still, at, at.yaw, `forest-path-branches-${i}`));
    cairn(still, CAIRN, 'forest-path-cairn');
    plasticBag(still, BAG);
    // The log by the gate, from `index.ts`, halfway along.
    const log = { x: 5.95, z: 24.8, y: 0.38 };
    return [watching, posts[2]!, stumpTops[0]!, stumpTops[2]!, stumpTops[3]!, log];
  });
  if (ctx.state.time === 'day') crows(kit, ctx, perches);
  branchDrips(kit, ctx, height, [
    { x: 1.4, z: 26.9 },
    { x: -0.5, z: 14 },
    { x: 6.5, z: -10.5 },
  ]);
}
