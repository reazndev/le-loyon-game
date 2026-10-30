import { holds, type NodeId } from '../../content';
import type { StateView } from '../../game/conditions';
import type { ForumStage } from '../../desktop';

/**
 * The inn turns the story's days and nights. Dinner starts nights 1 and 2, Yannick's confession
 * starts night 3, and sleeping in room 3 ends nights 1 and 2. These rules are pure, for tests.
 */

/** The current day. An unset count is the first day: the bus stop may not have set it. */
export const dayOf = (state: StateView): number => state.count('day') || 1;
export const nightOf = (state: StateView): number => state.count('night');

/** Day 2, the dig is ready, and Monique hasn't served the rösti yet. Raymond waits in the café. */
export function isDayTwoEvening(state: StateView): boolean {
  return dayOf(state) === 2 && nightOf(state) === 0 && holds('has_shovel', state) && holds('suspects_empty_coffin', state) && !state.hasFlag('dinner_day2');
}

/**
 * Day 3 after the forest grave, or after the editor's call once the food is packed. The café is
 * dark, Monique is in her kitchen, and the board shows stage 5.
 */
export function isDayThreeEvening(state: StateView): boolean {
  if (dayOf(state) !== 3 || nightOf(state) !== 0 || state.hasFlag('met_veilleur')) return false;
  return state.hasFlag('found_forest_grave') || (state.hasFlag('editor_called') && holds('has_food', state));
}

/** The board stage at the inn computer. Stage 5 belongs to the evening only. */
export function innStage(state: StateView, evening: boolean): Exclude<ForumStage, 0> {
  const day = dayOf(state);
  if (day >= 3) return evening ? 5 : 4;
  if (day === 2) return state.hasFlag('found_hidden_door') || holds('has_shovel', state) ? 3 : 2;
  return 1;
}

/** The morning of the ending: the reporter is back from the bunker and hasn't phoned yet. */
export const isEndingMorning = (state: StateView): boolean => state.hasFlag('met_marc');

/** What the bed in room 3 does. */
export type BedOutcome =
  | { kind: 'refuse'; node: NodeId }
  | { kind: 'refuse'; line: string }
  | { kind: 'sleep'; wake: number; leftOpen: boolean };

export function bedOutcome(state: StateView): BedOutcome {
  const night = nightOf(state);
  if (night === 0) {
    if (dayOf(state) === 2 && !state.hasFlag('dinner_day2')) return { kind: 'refuse', line: 'Not yet. I need to know more first.' };
    return { kind: 'refuse', node: 'room_bed' };
  }
  if (night === 1) return { kind: 'sleep', wake: 2, leftOpen: false };
  if (night === 2) {
    if (!state.hasFlag('opened_coffin')) return { kind: 'refuse', line: 'Not yet. Not without opening it.' };
    return { kind: 'sleep', wake: 3, leftOpen: !state.hasFlag('grave_refilled') };
  }
  return { kind: 'refuse', line: 'Not tonight.' };
}

/** The date and time on the black card before each morning. */
export const mornings: Record<number, [string, string]> = {
  2: ['Wednesday 18 November 1998', '07:40'],
  3: ['Thursday 19 November 1998', '08:15'],
  4: ['Friday 20 November 1998', '06:50'],
};
