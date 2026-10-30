import type { LevelKit } from '../../game/kit/levelKit';
import type { Beat } from '../../game/scares/beats';
import type { SceneContext } from '../../game/scene';
import { lookPoint } from './beats';
import { height, markers } from './layout';
import type { StoryPhase } from './story';

const { for2_cup: STUMP } = markers;
const STUMP_HEIGHT = 0.62;

/**
 * A stump beside the fort branch, passed on every walk up. On day 2, once the reporter has been
 * inside the fort, an army tin cup stands on it with an inch of cold coffee: someone was here
 * between the walk up and the walk back (for2_cup). Looking at it, the forest goes quiet. Returns
 * the beats for the scene's director.
 */
export function cupOnTheStump(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): Beat[] {
  kit.cylinder({ r: 0.3, h: STUMP_HEIGHT + 0.1, sides: 7 }).texture('bark_spruce', { tile: 0.7 }).color(0x5e564c).at(STUMP.x, -0.1, STUMP.z).onGround().collider();
  kit.cylinder({ r: 0.27, h: 0.03, sides: 7 }).texture('wood_planks', { tile: 0.4 }).color(0x8a7c68).at(STUMP.x, STUMP_HEIGHT, STUMP.z).onGround();
  if (phase !== 'day2' || !ctx.state.hasFlag('bunker_door_open')) return [];

  const cup = { x: STUMP.x + 0.06, z: STUMP.z - 0.04 };
  kit
    .group((g) => {
      g.cylinder({ r: 0.045, h: 0.085, sides: 8 }).color(0x9a9c94);
      g.cylinder({ r: 0.038, h: 0.005, sides: 8 }).color(0x1e1a14).at(0, 0.06, 0);
      g.box({ w: 0.012, h: 0.05, d: 0.035 }).color(0x6a6e64).at(0.05, 0.02, 0);
    })
    .at(cup.x, STUMP_HEIGHT + 0.03, cup.z)
    .rotY(70)
    .onGround();
  return [
    {
      id: 'for2_cup',
      when: { look: { ...lookPoint(STUMP, height, STUMP_HEIGHT), within: 8, angle: 18, hold: 0.8 } },
      do: [{ silence: 9 }],
    },
  ];
}
