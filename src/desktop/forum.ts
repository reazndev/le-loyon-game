import type { StateView } from '../game/conditions';

/** Which posts the Alpine Anomalies board shows. 0 is the prologue at home; 1 to 5 are the inn. */
export type ForumStage = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * The board stage for the inn computer, from the `day` count and the story flags. When `day`
 * is unset, the day is inferred from what the player has done.
 */
export function forumStage(state: StateView): Exclude<ForumStage, 0> {
  const day = state.count('day') || inferDay(state);
  if (day >= 3) return state.hasFlag('found_forest_grave') ? 5 : 4;
  if (day === 2) return state.hasFlag('found_hidden_door') || hasShovel(state) ? 3 : 2;
  return 1;
}

function inferDay(state: StateView): number {
  if (state.hasFlag('opened_coffin')) return 3;
  if (state.hasFlag('found_bunker') || state.hasFlag('skipped_follow')) return 2;
  return 1;
}

function hasShovel(state: StateView): boolean {
  return state.hasFlag('has_shovel') || state.hasItem('shovel');
}
