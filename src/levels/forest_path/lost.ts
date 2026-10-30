import type { SceneContext } from '../../game/scene';
import { playNode } from './play';
import { nearestOnTrails, type Trail } from './trail';

const LOST_DISTANCE = 20;
const LOST_SECONDS = 10;

/**
 * `forest_lost` from the script: wander more than 20 m off the path for 10 seconds and the
 * reporter gives up and turns back toward it. Returns the scene's per-frame update.
 */
export function lostInTheFog(trails: readonly Trail[]): (dt: number, ctx: SceneContext) => void {
  let offPath = 0;
  let turningBack = false;
  return (dt, ctx) => {
    if (turningBack) return;
    const { x, z } = ctx.player.position;
    offPath = nearestOnTrails(trails, x, z).distance > LOST_DISTANCE ? offPath + dt : 0;
    if (offPath < LOST_SECONDS) return;
    turningBack = true;
    void playNode(ctx, 'forest_lost').then(() => {
      const target = nearestOnTrails(trails, ctx.player.position.x, ctx.player.position.z);
      ctx.player.yaw = Math.atan2(-(target.x - ctx.player.position.x), -(target.z - ctx.player.position.z));
      offPath = 0;
      turningBack = false;
    });
  };
}
