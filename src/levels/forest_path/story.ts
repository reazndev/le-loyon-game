import type { StateView } from '../../game/conditions';
import type { TimeOfDay } from '../../game/state';

/**
 * Where the story stands, as the forest and the fort see it. Every scene in the Bois-Noir
 * dresses itself from this one value, so the day and night rules live in one place.
 */
export type StoryPhase = 'day1' | 'night1' | 'day2' | 'night2' | 'day3' | 'night3' | 'dawn';

/** Reads the `day` and `night` counts from the script. Unset counts read as the first day and night. */
export function storyPhase(state: StateView & { readonly time: TimeOfDay }): StoryPhase {
  if (state.time === 'night') {
    const night = state.count('night');
    return night >= 3 ? 'night3' : night === 2 ? 'night2' : 'night1';
  }
  // The walk out of the tunnel after Marc's monologue is daylight, before any sleep.
  if (state.hasFlag('met_marc')) return 'dawn';
  const day = state.count('day');
  return day >= 3 ? 'day3' : day === 2 ? 'day2' : 'day1';
}

export const isNight = (phase: StoryPhase): boolean => phase.startsWith('night');

/**
 * Marquise on day 2 when the reporter didn't follow the figure on night 1: she stands at the
 * shrine fork instead of the field edge, and the fort shows up the right branch (05-forest-bunker.md).
 */
export const heiferAtTheFork = (state: StateView, phase: StoryPhase): boolean =>
  phase === 'day2' && state.hasFlag('skipped_follow') && !state.hasFlag('heifer_found') && !state.hasFlag('heifer_returned');
