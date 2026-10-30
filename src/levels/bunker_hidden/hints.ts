import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { Arrival } from './arrival';

type Spot = { x: number; z: number };

export interface RoomLayout {
  /** The way back to the dormitory. */
  threshold: Spot;
  /** The steel door to the escape tunnel. */
  tunnelDoor: Spot;
  rungs: Spot;
  /** Where the pipe starts, along x. */
  tunnelStart: number;
}

/** Seconds in the dark room before the clue says where to point the torch. */
const STUCK = 25;

/** The clue under the goal line: what to look at, where to point the torch, and the tunnel out. */
export function hints(kit: LevelKit, ctx: SceneContext, arrival: Arrival, layout: RoomLayout): void {
  const lights = kit.use((k) => k.world.lights);
  const metMarc = { flag: 'met_marc' };
  const notYet = { notFlag: 'met_marc' };

  kit.hint(arrival === 'dark' ? "It's black in here. Turn your torch on." : "Turn your torch on. The candle doesn't reach far.", {
    when: () => !lights.flashlightOn,
  });

  kit.hint('Climb the rungs. The hatch opens onto the forest.', { if: metMarc, near: { ...layout.rungs, r: 3 }, point: layout.rungs });
  kit.hint('Go out by the tunnel at the back, not the front.', { if: metMarc, near: { ...layout.threshold, r: 1.2 }, point: layout.tunnelDoor });
  kit.hint('Keep going, crouched, to the iron rungs at the end.', { if: metMarc, when: () => ctx.player.position.x > layout.tunnelStart, point: layout.rungs });
  kit.hint("Open the low steel door at the back. That's the tunnel.", { if: metMarc, point: layout.tunnelDoor });

  if (arrival === 'dark') {
    kit.hint('Shine your torch into the far corners of the room.', { if: notYet, when: () => ctx.time > STUCK });
    kit.hint('Sweep your torch slowly round the room.', { if: notYet });
  } else {
    kit.hint('This door can wait. Look around the room first.', { if: notYet, near: { ...layout.tunnelDoor, r: 1.3 } });
    kit.hint('Look at the table, the bed, and the shelves.', { if: notYet });
  }
}
