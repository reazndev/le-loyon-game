import type { Condition } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import { anyOf, anywhere, HEIFER_LAG, heiferClues, steps, upTheForest, viaTheSquare } from '../forest_path/steps';
import { pointAlong } from '../forest_path/trail';
import { BERNARD, forestTrack, GATE, MARQUISE } from './layout';

const near = (spot: { x: number; z: number }, r: number) => ({ x: spot.x, z: spot.z, r });

const day2: Condition = { count: [['day', '==', 2], ['night', '==', 0]] };
const leading: Condition = { all: [day2, { flag: 'heifer_found', notFlag: 'heifer_returned' }] };
/** She stands at the forest edge, as `heiferPlace` puts her. */
const atTheEdge: Condition = { all: [day2, { notFlag: ['heifer_found', 'heifer_returned', 'skipped_follow'] }] };
const metTheFarmer: Condition = { flag: 'heifer_missing' };

/** The clue under the goal line: the farmer in the yard, the gate and the field up to the heifer, and leading her home. */
export function hints(kit: LevelKit, heiferGap: () => number): void {
  kit.hint(heiferClues.lagging, { if: leading, near: anywhere, when: () => heiferGap() > HEIFER_LAG });
  kit.hint('Talk to the farmer now, with her close behind you.', { if: leading, near: near(BERNARD, 8), point: BERNARD });
  kit.hint('Lead her down the field and through the gate to the farmer.', { if: leading, point: BERNARD });

  kit.hint(heiferClues.walkUp, { if: atTheEdge, near: near(MARQUISE, 12) });
  kit.hint('No heifer here. Follow the track on into the forest.', { if: { all: [steps.heifer, { flag: 'skipped_follow' }] }, near: near(MARQUISE, 12), point: pointAlong(forestTrack, Infinity) });
  kit.hint('Up the field between the fences, to the dark trees.', { if: steps.heifer, near: near(GATE, 6) });
  kit.hint('Through the gate behind the shed, then up the field to the trees.', { if: steps.heifer });

  kit.hint('Talk to the farmer in the yard again, about the spade.', { if: { all: [steps.spade, { flag: 'heifer_returned' }] } });
  kit.hint('The farmer is in the yard, by the dung heap.', { if: anyOf({ all: [steps.village, { not: metTheFarmer }] }, steps.spade) });

  kit.hint('The track at the top of the field runs into the forest.', { if: upTheForest });
  viaTheSquare(kit, 'Take the road east to the square', ['farm', 'forest']);
}
