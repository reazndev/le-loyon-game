import type { Condition } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { FORK, main, markers, toFort, toStream } from './layout';
import { anyOf, anywhere, atTheCemetery, atTheFarm, HEIFER_LAG, heiferClues, steps, upTheForest, viaTheSquare } from './steps';
import { heiferAtTheFork, isNight, type StoryPhase } from './story';
import { pointAlong } from './trail';

const near = (spot: { x: number; z: number }, r: number) => ({ x: spot.x, z: spot.z, r });
/** Down the main path toward the cemetery, up the fort branch, and along the stream branch, clear of the fork. */
const towardCemetery = near(pointAlong(main, 38), 30);
const upToFort = near(pointAlong(toFort, 26), 15);
const downToStream = near(pointAlong(toStream, 25), 14);

const day2: Condition = { count: [['day', '==', 2], ['night', '==', 0]] };
const leading: Condition = { all: [day2, { flag: 'heifer_found', notFlag: 'heifer_returned' }] };

/**
 * The clue under the goal line. The forest is the junction between the cemetery, the fort, and
 * the Yerly field, so most clues say which way to turn at the shrine: uphill, the way the
 * Virgin faces, to the fort; down toward the water for the farm; back down the path for the village.
 */
export function hints(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, heiferGap: () => number): void {
  const lights = kit.use((k) => k.world.lights);
  if (isNight(phase)) kit.hint('Too dark to see the path. Turn your torch back on.', { if: { item: 'flashlight' }, when: () => !lights.flashlightOn });

  kit.hint(heiferClues.lagging, { if: leading, near: anywhere, when: () => heiferGap() > HEIFER_LAG });
  [towardCemetery, upToFort].forEach((spot) => kit.hint('Wrong way for the farm. Back to the shrine, then down to the water.', { if: leading, near: spot }));
  kit.hint('Lead her down past the shrine, over the stream, to the field.', { if: leading });

  if (heiferAtTheFork(ctx.state, phase)) {
    kit.hint(heiferClues.walkUp, { if: { notFlag: 'heifer_found' }, near: near(markers.for2_heifer_fork, 9) });
    kit.hint('Look for her at the fork, by the little shrine.', { if: steps.heifer });
  }

  kit.hint('The steps went uphill, the way the Virgin in the shrine faces.', { if: steps.follow, near: near(FORK, 7) });
  kit.hint('Only water down this way. The steps went up the other branch.', { if: steps.follow, near: downToStream });
  kit.hint('Keep to the path, uphill and away from the cemetery.', { if: steps.follow });

  kit.hint('The Virgin in the shrine faces the uphill branch. Take it.', { if: upTheForest, near: near(FORK, 7) });
  kit.hint('At the shrine, take the branch that climbs to the barn.', { if: steps.searchBunker });
  kit.hint('At the shrine, take the branch that climbs to the fort.', { if: anyOf(steps.larch, steps.knock) });
  kit.hint('At the shrine, take the branch that climbs uphill.', { if: steps.forestByDay });

  kit.hint('Take the branch that drops toward the sound of water.', { if: atTheFarm, near: near(FORK, 7) });
  kit.hint('At the shrine, go down over the stream to the Yerly field.', { if: atTheFarm });

  kit.hint('Back down the path to the gate in the cemetery wall.', { if: atTheCemetery });
  kit.hint('Back down the path to the cemetery, then on to the village.', { if: steps.tunnel });
  viaTheSquare(kit, 'Back through the cemetery to the square', ['cemetery', 'farm', 'forest']);
}
