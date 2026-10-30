import { Vector3 } from 'three';
import type { Point3 } from '../../engine/audio/audioManager';
import { everyFrame } from '../ambient/schedule';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { viewAngle } from './beats';
import { IN_VIEW, OUT_OF_VIEW } from './figure';

export interface LookBackOptions {
  /** The thing that changes: the chair's seat, the door's edge, the screen. */
  at: Point3;
  /** Runs once, while the player isn't looking. */
  change: () => void;
  /** Only changes while this holds. */
  if?: () => boolean;
  /** Seconds the point must be out of view first. Default 2. */
  away?: number;
  /** The player has to have seen it from closer than this, in meters. Default 20. */
  within?: number;
}

/**
 * Something that moves while the player isn't looking: a chair turned, a door left ajar, a
 * television on. Once the player has had `at` in view, `change` runs the first time it has been
 * out of view for `away` seconds, so they look back and find it different.
 */
export function lookBack(kit: LevelKit, ctx: SceneContext, options: LookBackOptions): void {
  const { at, change, away = 2, within = 20 } = options;
  const view = new Vector3();
  const camera = ctx.player.camera;
  let seen = false;
  let awayFor = 0;
  let done = false;
  everyFrame(kit, (dt) => {
    if (done || ctx.paused) return;
    const eye = camera.position;
    camera.getWorldDirection(view);
    const angle = viewAngle({ eye, view }, at);
    if (angle < IN_VIEW && Math.hypot(at.x - eye.x, at.z - eye.z) < within) {
      seen = true;
      awayFor = 0;
      return;
    }
    if (!seen || angle < OUT_OF_VIEW) return;
    awayFor += dt;
    if (awayFor < away || options.if?.() === false) return;
    done = true;
    change();
  });
}
