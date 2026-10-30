import type { StateView } from '../../game/conditions';
import type { TimeOfDay } from '../../game/state';

/**
 * What happens when the reporter rings at Odile's door (02-village.md, Odile's entry table):
 * - `refuses`: day 1. She opens a hand's width, says no, and locks the door twice.
 * - `curtain`: before the abbé has let the reporter read the register, and at night. Nobody comes.
 * - `lets_in`: from day 2, once the register is read. The door leads to the kitchen.
 */
export type Doorstep = 'refuses' | 'curtain' | 'lets_in';

export function doorstep(state: StateView & { readonly time: TimeOfDay }): Doorstep {
  if (state.time === 'night') return 'curtain';
  if (state.count('day') <= 1) return 'refuses';
  return state.hasFlag('read_register') ? 'lets_in' : 'curtain';
}
