import type { LevelKit } from '../../game/kit/levelKit';
import { everyFrame } from '../../game/ambient';

/** Clockwise angle from twelve, in radians, of a second hand that jumps once a second. */
export function secondHandAngle(seconds: number): number {
  return ((Math.floor(seconds) % 60) * Math.PI) / 30;
}

/**
 * A thin second hand on a wall clock that faces +Z, its pivot at `at`. It jumps on each tick,
 * and stands still while `running` returns false, so a clock that stops for a beat stops here too.
 */
export function secondHand(kit: LevelKit, at: { x: number; y: number; z: number }, length: number, running: () => boolean = () => true): void {
  const hand = kit
    .group((g) => g.box({ w: 0.006, h: length, d: 0.004 }).color(0x7a2a22).at(0, -length * 0.2, 0))
    .at(at.x, at.y, at.z)
    .dynamic();
  let seconds = Math.random() * 60;
  everyFrame(kit, (dt) => {
    if (running()) seconds += dt;
    hand.object.rotation.z = -secondHandAngle(seconds);
  });
}
