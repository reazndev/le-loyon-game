import type { StateView } from '../../game/conditions';
import type { TimeOfDay } from '../../game/state';
import { storyPhase } from '../forest_path/story';

/** Where Abbé Overney is in the church, from the table in docs/script/03-church.md. */
export type AbbeSpot = 'candles' | 'nave' | 'sacristy' | 'sacristy_door' | 'office' | 'kneeling';

type ChurchState = StateView & { readonly time: TimeOfDay };

/** Null when he isn't in the church: at night, after Marc, on the ending morning, and behind the sacristy door on day 3. */
export function overneySpot(state: ChurchState): AbbeSpot | null {
  if (state.count('day') >= 4) return null;
  switch (storyPhase(state)) {
    case 'day1':
      return state.hasFlag('abbe_told_graves') ? 'sacristy' : 'candles';
    case 'day2':
      if (!state.hasFlag('read_register')) return 'nave';
      return state.hasFlag('abbe_seal_hint') ? 'office' : 'sacristy_door';
    case 'day3':
      return state.hasFlag('abbe_day3') ? null : 'kneeling';
    default:
      return null;
  }
}

/** Day 2: the register is read and the abbé is waiting to speak about the seal. */
export function sealDue(state: ChurchState): boolean {
  return overneySpot(state) === 'sacristy_door';
}
