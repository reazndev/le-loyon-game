import type { LevelKit } from '../../game/kit/levelKit';
import { viaTheSquare } from '../forest_path/steps';
import { GARDEN } from './garden';

/** The clue under the goal line: the trodden path to the garden, and the way back to the village for every step. */
export function hints(kit: LevelKit, house: { x: number; z: number; w: number; d: number }): void {
  // In front of the house, where the path round its east side starts. The garden shows from day 2, like its hotspot.
  kit.hint('Someone has trodden a path round the right of the house.', {
    if: { count: [['day', '>=', 2], ['night', '==', 0]] },
    near: { x: house.x + house.w / 2 + 1, z: house.z + house.d / 2 + 2, r: 5 },
    point: GARDEN,
  });
  viaTheSquare(kit, 'Take the road east to the square');
}
