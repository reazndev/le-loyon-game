import { dustMotes, loop, nowAndThen, particles, sway } from '../../game/ambient';
import { passingEngine } from '../../game/ambient/sounds';
import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { clockTick, radiatorKnock, tvMurmur } from '../inn/sounds';
import { CLOCK, RADIATOR } from './clutter';
import { DESK, ROOM, WINDOW } from './room';

/**
 * The flat late at night besides the rain, the fridge, and the computer: dust in the lamplight,
 * the curtain in the draft, the clock, the radiator knocking, the neighbour's television
 * through the east wall, and now and then a car on the wet street below.
 */
export function flatAmbience(kit: LevelKit, ctx: SceneContext, curtain: Placed): void {
  const pane = { x: (WINDOW.x0 + WINDOW.x1) / 2, z: -ROOM.halfD };
  particles(kit, dustMotes({ count: 45, box: [1.4, 1, 1], opacity: 0.4, size: 0.012, seed: 'home-lamp' })).at(DESK.x - 0.1, DESK.top + 0.5, DESK.z + 0.2);
  // A faint stir where the cold comes in round the frame.
  particles(kit, dustMotes({ count: 18, box: [1, 1, 0.5], velocity: [0.01, 0.01, 0.03], opacity: 0.3, size: 0.012, seed: 'home-window' })).at(pane.x, 1.5, pane.z + 0.35);
  sway(kit, curtain, { degrees: 1.6, speed: 0.11, axis: 'x' });

  loop(kit, () => clockTick(ctx.audio, CLOCK, 0.12));
  loop(kit, () => tvMurmur(ctx.audio, { x: ROOM.halfW + 1.2, y: 1.2, z: -0.4 }, 0.07));
  nowAndThen(kit, ctx, 80, () => radiatorKnock(ctx.audio, RADIATOR, 0.3), 25);
  nowAndThen(kit, ctx, 70, () => {
    const side = Math.random() < 0.5 ? 1 : -1;
    const street = (x: number) => ({ x, y: -7, z: pane.z - 9 });
    passingEngine(ctx.audio, street(-30 * side), street(30 * side), { kind: 'car', seconds: 7, volume: 0.35 });
  }, 20);
}
