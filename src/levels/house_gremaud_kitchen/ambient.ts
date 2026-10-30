import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { cat, distantTraffic, dustMotes, loop, nowAndThen, particles, suddenLife, sway, weather } from '../../game/ambient';
import { rain } from '../../game/ambient/sounds';
import { houseCreak, radiatorKnock } from '../inn/sounds';
import { secondHand } from '../laiterie/secondHand';
import { CAT_SPOT, curtain, DRAFTY_CURTAIN, RADIATOR } from './clutter';
import type { PausableLoop } from './clock';
import { CLOCK, NIGHT_LAMP, NORTH, PENDANT, ROOM, WINDOW } from './layout';

/**
 * What moves in Odile's kitchen: the clock's second hand, which stops when the clock does, one
 * curtain stirring at the window, her grey cat on the counter, dust in the light, and the house
 * around it: the radiator, rain on the glass, a car on the road, the floor upstairs at night.
 */
export function kitchenAmbient(kit: LevelKit, ctx: SceneContext, night: boolean, clock: PausableLoop): void {
  suddenLife(kit, ctx, 'indoors');
  secondHand(kit, { x: CLOCK.x, y: CLOCK.y, z: NORTH + 0.068 }, 0.12, () => clock.playing);

  const drafty = kit.group((g) => curtain(g)).at(DRAFTY_CURTAIN.x, DRAFTY_CURTAIN.y, DRAFTY_CURTAIN.z).dynamic();
  sway(kit, drafty, { axis: 'x', degrees: 2.5, speed: 0.1 });

  cat(kit, ctx, CAT_SPOT);

  if (night) particles(kit, dustMotes({ box: [1.2, 1, 1.4], count: 30, size: 0.014 })).at(NIGHT_LAMP.x + 0.55, 1.3, NIGHT_LAMP.z);
  else {
    particles(kit, dustMotes({ box: [1.3, 1.2, 1.2], count: 22, size: 0.01, opacity: 0.35 })).at(WINDOW.x, 1.55, NORTH + 1);
    particles(kit, dustMotes({ box: [1.2, 0.9, 1.2], count: 15, size: 0.01, opacity: 0.35, seed: 'kitchen-lamp' })).at(PENDANT.x, 1.55, PENDANT.z);
  }

  // Quieter than the clock: the clock is the loudest thing in the house.
  nowAndThen(kit, ctx, 75, () => radiatorKnock(ctx.audio, RADIATOR, 0.3));
  if (weather(ctx.state).drizzle) loop(kit, () => rain(ctx.audio, { at: { x: WINDOW.x, y: 1.6, z: ROOM.z0 - 0.3 }, surface: 'glass', volume: 0.25 }));
  distantTraffic(kit, ctx, [{ x: -60, y: 0, z: -18 }, { x: 60, y: 0, z: -18 }], night ? 300 : 180);
  if (night) nowAndThen(kit, ctx, 80, () => houseCreak(ctx.audio, { x: (Math.random() - 0.5) * 3, y: ROOM.h + 0.4, z: (Math.random() - 0.5) * 3 }, 0.25));
}
