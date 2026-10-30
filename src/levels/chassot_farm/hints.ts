import type { Condition } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import { viaTheSquare } from '../forest_path/steps';
import { GARDEN } from './garden';
import { gratingAt, hatchAt } from './hatch';
import { KOLLY_DOOR } from './kolly';

/** The clue under the goal line: the trodden path to the garden, and the way back to the village for every step. */
export function hints(kit: LevelKit, house: { x: number; z: number; w: number; d: number }): void {
  const byDay: Condition = { count: [['night', '==', 0]] };
  const toKolly = { x: KOLLY_DOOR.x, z: KOLLY_DOOR.z - 0.6 };
  // Minet (A7): the crying under the house, the old woman across the road, and the way back to her.
  kit.hint('Take Minet back across the road.', { if: { item: 'minet' }, point: toKolly });
  kit.hint('Something is crying under the house. Listen at the grating.', {
    if: { ...byDay, notFlag: ['heard_minet', 'minet_returned'], notItem: 'minet' },
    near: { ...hatchAt(house), r: 4 },
    point: gratingAt(house),
  });
  kit.hint('Tell the old woman across the road.', { if: { ...byDay, flag: 'heard_minet', notFlag: 'cellar_code_hint' }, point: toKolly });
  // In front of the house, where the path round its east side starts. The garden shows from day 2, like its hotspot.
  kit.hint('Someone has trodden a path round the right of the house.', {
    if: { count: [['day', '>=', 2], ['night', '==', 0]] },
    near: { x: house.x + house.w / 2 + 1, z: house.z + house.d / 2 + 2, r: 5 },
    point: GARDEN,
  });
  viaTheSquare(kit, 'Take the road east to the square');
}
