import type { Surface } from '../../engine/physics/ground';
import type { LevelKit } from '../../game/kit/levelKit';
import { yawToward, type Trail } from '../forest_path/trail';

export interface RoadLook {
  width: number;
  texture: string;
  tile?: number;
  color?: number;
  surface?: Surface;
  /** Height over the ground, so roads laid later sit on top of earlier ones. */
  lift?: number;
}

/**
 * A flat road along a trail, one walkable plane per leg. Each leg runs on past its ends by half
 * the width, so the corners close. Village ground is flat, so flat planes are enough.
 */
export function road(kit: LevelKit, trail: Trail, look: RoadLook): void {
  const lift = look.lift ?? 0.03;
  trail.slice(1).forEach(([bx, bz], i) => {
    const [ax, az] = trail[i]!;
    const length = Math.hypot(bx - ax, bz - az) + look.width;
    kit
      .plane({ w: look.width, d: length, cell: 1 })
      .texture(look.texture, { tile: look.tile ?? 3 })
      .color(look.color ?? 0xffffff)
      // Each leg a hair above the last, so the overlaps at the corners don't flicker.
      .at((ax + bx) / 2, lift + i * 0.004, (az + bz) / 2)
      .rotY(yawToward(bx - ax, bz - az))
      .walkable(look.surface ?? 'stone');
  });
}
