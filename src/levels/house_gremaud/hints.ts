import type { LevelKit } from '../../game/kit/levelKit';
import { steps, viaTheSquare } from '../forest_path/steps';
import { DOOR } from './house';

/** The clue under the goal line: whether ringing will get an answer, and the way back to the village. */
export function hints(kit: LevelKit, night: boolean): void {
  const porch = { x: DOOR.x, z: DOOR.z + 0.7, r: 4 };
  if (night) kit.hint('Nobody answers the door at night.', { near: porch });
  kit.hint('Nobody comes yet. See the priest about the register first.', { if: steps.register, near: porch });
  kit.hint('Ring the bell. This time she may let you in.', { if: steps.widow, near: porch });
  kit.hint('Ring the bell on the porch.', { if: steps.village, near: porch });
  kit.hint('Up the gravel path to the porch, and ring the bell.', { if: steps.widow });
  viaTheSquare(kit, 'Out the garden gate to the square', ['gremaud']);
}
