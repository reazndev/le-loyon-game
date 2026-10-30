import type { LevelKit } from '../../game/kit/levelKit';
import { pendantLamp } from '../inn/interior';
import { BENCH, LIFT, PIT, ROOM } from './layout';

/**
 * Two fluorescent tubes on chains, one over each bay, and a bare bulb over the bench. By day
 * they give a cold, hard light; at night the garage is shut and they are dark.
 */
export function buildLights(kit: LevelKit, on: boolean): void {
  strip(kit, LIFT.x, LIFT.z + 0.4, on, 0.06);
  strip(kit, PIT.x, PIT.z - 0.6, on, 0.3);
  pendantLamp(kit, { x: BENCH.x, y: ROOM.h, z: BENCH.z + 0.45 }, { on, color: 0xffd8a0, intensity: 1.3, range: 4, drop: 1 });
}

function strip(kit: LevelKit, x: number, z: number, on: boolean, flicker: number): void {
  const y = ROOM.h - 0.55;
  [-0.55, 0.55].forEach((dx) => kit.cylinder({ r: 0.006, h: 0.55, sides: 4 }).color(0x1a1a1a).at(x + dx, y, z));
  kit.box({ w: 1.4, h: 0.06, d: 0.18 }).texture('rust_metal', { tile: 0.6 }).color(0x6c6e68).at(x, y, z);
  const tube = kit.box({ w: 1.25, h: 0.045, d: 0.06 }).at(x, y - 0.045, z);
  if (!on) {
    tube.color(0x4a4c4a);
    return;
  }
  tube.color(0xdce6e2).unlit();
  [-0.4, 0.4].forEach((dx) => kit.glow(0.9, 0x34403e).at(x + dx, y - 0.04, z));
  kit.light({ color: 0xb2c4c2, intensity: 1.5, range: 7.5 }).flicker(flicker).at(x, y - 0.3, z);
}
