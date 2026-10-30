import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { everyFrame, fluorescentTube } from '../../game/ambient';
import { pendantLamp } from '../inn/interior';
import { BENCH, LIFT, PIT, ROOM } from './layout';

const TUBE_INTENSITY = 1.5;

/**
 * Two fluorescent tubes on chains, one over each bay, and a bare bulb over the bench. By day
 * they give a cold, hard light, and the one over the pit is failing: it stutters out every few
 * seconds with a tick from its starter. At night the garage is shut and they are dark.
 */
export function buildLights(kit: LevelKit, ctx: SceneContext, on: boolean): void {
  strip(kit, LIFT.x, LIFT.z + 0.4, on, 0.06);
  const failing = strip(kit, PIT.x, PIT.z - 0.6, on);
  if (failing) {
    const { light, tube, glows, at } = failing;
    fluorescentTube(kit, ctx, light, tube, at, 3);
    everyFrame(kit, () => glows.forEach((glow) => (glow.object.visible = (light.light?.intensity ?? TUBE_INTENSITY) > TUBE_INTENSITY / 2)));
  }
  pendantLamp(kit, { x: BENCH.x, y: ROOM.h, z: BENCH.z + 0.45 }, { on, color: 0xffd8a0, intensity: 1.3, range: 4, drop: 1 });
}

/** One strip light. Without `flicker` it is the failing tube, and its parts are returned to drive it. */
function strip(kit: LevelKit, x: number, z: number, on: boolean, flicker?: number) {
  const y = ROOM.h - 0.55;
  [-0.55, 0.55].forEach((dx) => kit.cylinder({ r: 0.006, h: 0.55, sides: 4 }).color(0x1a1a1a).at(x + dx, y, z));
  kit.box({ w: 1.4, h: 0.06, d: 0.18 }).texture('rust_metal', { tile: 0.6 }).color(0x6c6e68).at(x, y, z);
  const tube = kit.box({ w: 1.25, h: 0.045, d: 0.06 }).at(x, y - 0.045, z);
  if (!on) {
    tube.color(0x4a4c4a);
    return null;
  }
  const glows = [-0.4, 0.4].map((dx) => kit.glow(0.9, 0x34403e).at(x + dx, y - 0.04, z));
  const light = kit.light({ color: 0xb2c4c2, intensity: TUBE_INTENSITY, range: 7.5 }).at(x, y - 0.3, z);
  if (flicker !== undefined) {
    tube.color(0xdce6e2).unlit();
    light.flicker(flicker);
    return null;
  }
  // Lit through its emissive, so the stutter can dim it.
  tube.color(0x2a2e2c).emissive(0xb8c2be).dynamic();
  return { light, tube, glows, at: { x, y: y - 0.05, z } };
}
