import { dustMotes, loop, miceInTheWalls, nowAndThen, particles, suddenLife, sway, weather } from '../../game/ambient';
import { fridgeHum, rain } from '../../game/ambient/sounds';
import type { MeshBuilder, Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { cafeLit, type InnDressing } from './dressing';
import { CAFE, CORRIDOR, KITCHEN_DOOR, RADIATOR, ROOM3, STAIRS, UPPER } from './layout';
import { radiatorKnock } from './sounds';
import { playChannel } from './television';

/**
 * What moves in the inn besides the people: dust where the windows light it, the curtain in
 * room 3 in a draft nobody can find, the local channel on the café television, the fridge in
 * Monique's kitchen, rain on the panes from night 2, and at night the radiator and mice upstairs.
 */
export function innAmbient(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, parts: { tvScreen: MeshBuilder; curtain: Placed }): void {
  suddenLife(kit, ctx, 'indoors');
  const lit = cafeLit(dressing);
  if (lit) {
    playChannel(kit, parts.tvScreen);
    // The grey light from the square through the two front windows, and room 3's window.
    particles(kit, dustMotes({ count: 30, box: [4, 1.2, 1.4], size: 0.012, opacity: 0.4, seed: 'inn-front' })).at(-1.7, 1.55, CAFE.z1 - 0.8);
    particles(kit, dustMotes({ count: 16, box: [1.4, 1.2, 1.2], size: 0.011, opacity: 0.35, seed: 'inn-room3' })).at(ROOM3.x1 - 0.8, UPPER + 1.5, RADIATOR.z);
  } else {
    particles(kit, dustMotes({ follow: true, box: [6, 3, 6], count: 50, opacity: 0.6, seed: 'inn-torch' }));
  }
  sway(kit, parts.curtain, { axis: 'z', degrees: 1.8, speed: 0.09 });

  loop(kit, () => fridgeHum(ctx.audio, { x: KITCHEN_DOOR.x + 0.4, y: 0.8, z: CAFE.z0 - 1.2 }, { volume: 0.35 }));
  if (weather(ctx.state).drizzle) {
    loop(kit, () => rain(ctx.audio, { at: { x: -1.7, y: 1.5, z: CAFE.z1 + 0.3 }, surface: 'glass', volume: 0.22 }));
    loop(kit, () => rain(ctx.audio, { at: { x: ROOM3.x1 + 0.3, y: UPPER + 1.5, z: RADIATOR.z }, surface: 'glass', volume: 0.25 }));
  }
  if (!dressing.night) return;
  nowAndThen(kit, ctx, 85, () => radiatorKnock(ctx.audio, RADIATOR, 0.32), 30);
  miceInTheWalls(
    kit,
    ctx,
    [
      { x: 2.4, y: UPPER + 0.15, z: CORRIDOR.z0 - 0.1 },
      { x: ROOM3.x0 + 1.6, y: UPPER + 0.1, z: ROOM3.z1 + 0.1 },
      { x: ROOM3.x0 + 1.2, y: UPPER + ROOM3.h, z: ROOM3.z0 + 0.8 },
      { x: STAIRS.x0 - 0.1, y: UPPER - 0.6, z: STAIRS.z1 + 1 },
    ],
    55,
  );
}
