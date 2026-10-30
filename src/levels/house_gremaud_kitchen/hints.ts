import type { LevelKit } from '../../game/kit/levelKit';
import { steps, viaTheSquare } from '../forest_path/steps';
import { TABLE } from './layout';

/** The clue under the goal line: the widow at the table, the diary she gave, and the way back to the village. */
export function hints(kit: LevelKit): void {
  kit.hint('Open your inventory and read his diary.', { if: { item: 'gremaud_diary', count: [['day', '==', 2]] }, near: { x: TABLE.x, z: TABLE.z, r: 1.5 } });
  kit.hint('The widow sits at the table. Talk to her.', { if: steps.widow, point: TABLE });
  viaTheSquare(kit, 'Out the front door to the square', ['gremaud']);
}
