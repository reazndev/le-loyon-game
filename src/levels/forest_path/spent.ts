import type { StateView } from '../../game/conditions';
import type { Beat } from '../../game/scares/beats';

/**
 * Beats already played this day or night, so walking back through a scene doesn't replay them:
 * the figure on the path, the cough, the mask that slid. They hold no story, so they live for the
 * session only, like the arrival at Marc's door, and a new day or night starts them fresh.
 */
const spent = new Set<string>();

const key = (state: StateView, id: string) => `${id}@${state.count('day')}.${state.count('night')}`;

export const isSpent = (state: StateView, id: string): boolean => spent.has(key(state, id));

/** The beats not yet played today or tonight, each marking itself spent when it fires. */
export function unspent(state: StateView, beats: Beat[]): Beat[] {
  return beats
    .filter((beat) => !isSpent(state, beat.id))
    .map((beat) => ({ ...beat, do: [{ run: () => void spent.add(key(state, beat.id)) }, ...beat.do] }));
}

/** A beat that plays once in the whole game, not once a day: it sets a flag named after itself. */
export const oncePerGame = (beat: Beat): Beat => ({ ...beat, set: beat.id });
