import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { distantTraffic, dustMotes, loop, miceInTheWalls, nowAndThen, particles, suddenLife, sway, weather } from '../../game/ambient';
import { rain } from '../../game/ambient/sounds';
import { radiatorKnock } from '../inn/sounds';
import { RADIATOR, WINDOW_LIGHT } from './clutter';
import { CLOCK, MILK_COUNTER, ROOM, SHOP_COUNTER, SHOP_WINDOW } from './layout';
import { secondHand } from './secondHand';
import { WALL } from '../inn/interior';

/**
 * What moves in the laiterie: dust in the light, a strip of flypaper turning in no draft, the
 * clock's second hand, and the sounds from outside it: rain on the window, a car on the road,
 * the radiator, and at night something in the dairy wall.
 */
export function laiterieAmbient(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  suddenLife(kit, ctx, 'indoors');
  secondHand(kit, { x: CLOCK.x, y: CLOCK.y, z: ROOM.z0 + WALL / 2 + 0.072 }, 0.13);
  flypaper(kit, MILK_COUNTER.x + 0.6, MILK_COUNTER.z + 1.3);

  if (night) particles(kit, dustMotes({ follow: true, box: [6, 3, 6], count: 60 }));
  else {
    particles(kit, dustMotes({ box: [1.8, 1.4, 1.6], count: 25, size: 0.01, opacity: 0.35 })).at(WINDOW_LIGHT.x, WINDOW_LIGHT.y, WINDOW_LIGHT.z);
    particles(kit, dustMotes({ box: [2, 1.2, 1.4], count: 22, size: 0.012, opacity: 0.4, seed: 'laiterie-counter' })).at(SHOP_COUNTER.x, 1.75, SHOP_COUNTER.z + 0.4);
  }

  nowAndThen(kit, ctx, night ? 90 : 55, () => radiatorKnock(ctx.audio, RADIATOR, night ? 0.35 : 0.5));
  if (weather(ctx.state).drizzle) loop(kit, () => rain(ctx.audio, { at: { x: SHOP_WINDOW.x, y: 1.5, z: ROOM.z1 + 0.3 }, surface: 'glass', volume: 0.3 }));
  // The road through the square, out past the shop window.
  distantTraffic(kit, ctx, [{ x: -70, y: 0, z: 14 }, { x: 70, y: 0, z: 14 }], night ? 240 : 140);
  if (night) miceInTheWalls(kit, ctx, [{ x: ROOM.x0, y: 0.2, z: -2.4 }, { x: -2.6, y: 0.2, z: ROOM.z0 }, { x: ROOM.x0, y: 1.8, z: 0.2 }], 60);
}

/**
 * A strip of flypaper hanging from the ceiling, black with last summer. It turns a little, slowly,
 * though the door is shut.
 */
function flypaper(kit: LevelKit, x: number, z: number): void {
  const length = 0.5;
  const strip = kit
    .group((g) => {
      g.cylinder({ r: 0.02, h: 0.05, sides: 5 }).color(0x8a6a3a).at(0, -0.05, 0);
      g.box({ w: 0.05, h: length, d: 0.004 }).color(0x8a6a34).at(0, -0.05 - length, 0);
      [0.08, 0.14, 0.21, 0.27, 0.33, 0.41].forEach((dy, i) => g.box({ w: 0.012, h: 0.008, d: 0.008 }).color(0x121110).at(((i * 7) % 5) * 0.008 - 0.016, -0.05 - dy, 0));
    })
    .at(x, ROOM.h, z)
    .dynamic();
  sway(kit, strip, { axis: 'y', degrees: 14, speed: 0.04 });
}
