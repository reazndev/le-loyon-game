import type { StateView } from '../../game/conditions';
import type { StoryPhase } from '../forest_path/story';

/** Set once Yannick has walked out on day 3, so he stays gone if the player comes back. */
export const YANNICK_LEFT = 'gar_yannick_left';

export interface GarageCast {
  /** Gilles at the bench. On day 1 he is in the inn café instead. */
  gilles: boolean;
  /** Yannick at the bench, under the Fiat, or not here. */
  yannick: 'bench' | 'lift' | null;
  /** After his day 3 line he walks out of the door and doesn't come back. */
  yannickLeaves: boolean;
}

const EMPTY: GarageCast = { gilles: false, yannick: null, yannickLeaves: false };

/** Who is in the garage, from 02-village.md. At night it is shut and empty. */
export function garageCast(phase: StoryPhase, state: StateView): GarageCast {
  switch (phase) {
    case 'day1':
      return { ...EMPTY, yannick: 'bench' };
    case 'day2':
      return { ...EMPTY, gilles: true, yannick: 'lift' };
    case 'day3': {
      const yannickHere = !state.hasFlag('met_veilleur') && !state.hasFlag(YANNICK_LEFT);
      return { gilles: !state.hasFlag('grave_left_open'), yannick: yannickHere ? 'bench' : null, yannickLeaves: yannickHere };
    }
    default:
      return EMPTY;
  }
}
