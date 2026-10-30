import type { StateView } from '../../game/conditions';
import { heiferAtTheFork, type StoryPhase } from '../forest_path/story';

/**
 * Where Marquise is, for puzzle P3 (00-overview.md):
 * - `missing`: day 1 and every night before she is home, and day 2 while she stands at the forest
 *   fork instead (the reporter didn't follow the figure on night 1). Out in the fog somewhere else.
 * - `at_the_edge`: day 2 until found. She stands at the forest edge above the field, staring in.
 * - `following`: found but not yet handed back to Bernard. She walks behind the reporter.
 * - `home`: Bernard has her back. She stands in the open stall by the cowshed.
 */
export type HeiferPlace = 'missing' | 'at_the_edge' | 'following' | 'home';

export function heiferPlace(state: StateView, phase: StoryPhase): HeiferPlace {
  if (state.hasFlag('heifer_returned')) return 'home';
  if (phase.startsWith('night') || phase === 'day1' || heiferAtTheFork(state, phase)) return 'missing';
  return state.hasFlag('heifer_found') ? 'following' : 'at_the_edge';
}
