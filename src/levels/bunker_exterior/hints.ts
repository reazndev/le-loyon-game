import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { isNight, type StoryPhase } from '../forest_path/story';

type Spot = { x: number; z: number };

export interface ClearingLayout {
  /** The steel door behind the barn's wooden front door. */
  door: Spot;
  hatch: Spot;
  thicket: Spot;
  /** True well off the path and out of the clearing. */
  offPath: (x: number, z: number) => boolean;
}

const HOME = 'Take the path down past the shrine to the cemetery and the village.';

/** The clue under the goal line: the barn's way in, the track up to the larch, the path home. */
export function hints(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, layout: ClearingLayout): void {
  const lights = kit.use((k) => k.world.lights);
  const near = (spot: Spot, r: number) => ({ x: spot.x, z: spot.z, r });
  const lost = () => layout.offPath(ctx.player.position.x, ctx.player.position.z);

  if (isNight(phase)) kit.hint("Turn your torch on. You'll lose the path without it.", { when: () => !lights.flashlightOn });
  kit.hint("You've left the path. Head back toward the barn's roof.", { when: lost, point: layout.door });

  if (phase === 'night1') {
    kit.hint('The steel door has a wheel. Try to turn it.', { if: { notFlag: 'found_bunker' }, near: near(layout.door, 3), point: layout.door });
    kit.hint("It won't give tonight. Leave it and go back down.", { if: { flag: 'found_bunker' }, near: near(layout.door, 3) });
    kit.hint('The steps went to the barn. Look behind its hanging front door.', { if: { notFlag: 'found_bunker' }, point: layout.door });
  } else if (phase === 'day2') {
    kit.hint('The track ends in thicket. Search inside the barn instead.', { if: { notFlag: 'found_hidden_door' }, near: near(layout.thicket, 5), point: layout.door });
    kit.hint("Go in through the steel door behind the barn's hanging front door.", { if: { notFlag: 'found_hidden_door' }, point: layout.door });
  } else if (phase === 'day3') {
    const climbing = { flag: 'read_gremaud_letter', notFlag: 'found_forest_grave' };
    kit.hint('Push through the young spruce. The larch is above.', { if: climbing, near: near(layout.thicket, 5) });
    kit.hint('Keep climbing past the hatch, up to the thicket.', { if: climbing, near: near(layout.hatch, 5), point: layout.thicket });
    kit.hint('The animal track climbs from the right side of the barn.', { if: climbing });
  } else if (phase === 'night3') {
    kit.hint('In through the steel door, then down the corridor to the bunks.', { if: { notFlag: 'entered_hidden_room' }, point: layout.door });
  } else if (phase === 'dawn') {
    kit.hint('Follow the track down past the barn, then the path to the village.');
  }
  kit.hint(HOME);
}
