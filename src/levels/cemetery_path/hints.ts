import type { LevelKit } from '../../game/kit/levelKit';
import type { Patrol } from '../../game/patrol/patrol';
import type { StoryPhase } from '../forest_path/story';
import { forestAhead } from '../cemetery/hints';

const UP = 'Follow the gravel up the switchbacks. The cemetery is at the top.';
const DOWN = 'Go down the path to the square. The inn is there.';

/** The clue under the goal line: which way the cemetery, the church, and the village are. */
export function hints(kit: LevelKit, phase: StoryPhase, patrol: Patrol | null): void {
  if (phase === 'night1') {
    kit.hint(UP, { if: { notFlag: ['found_bunker', 'skipped_follow'] } });
    kit.hint(DOWN);
  } else if (phase === 'night2') {
    kit.hint('That light is the watchman. Let him get well ahead of you.', { when: () => !!patrol?.raymond.object.visible });
    kit.hint(UP, { if: { notFlag: ['grave_refilled', 'grave_left_open'] } });
    kit.hint(DOWN);
  } else {
    kit.hint("The church's side door is at the bottom of this path.", { if: { count: [['day', '==', 2], ['night', '==', 0]], notFlag: 'read_register' } });
    kit.hint('The forest starts behind the cemetery, at the top of this path.', { if: forestAhead });
  }
}
