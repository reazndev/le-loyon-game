import type { GameState } from '../../game/state';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { dayOf, isDayThreeEvening, isDayTwoEvening, isEndingMorning } from './story';

/** How the inn is dressed for this visit, decided once when the scene builds. */
export interface InnDressing {
  phase: StoryPhase;
  day: number;
  /** Closed for the night: chairs up, the café dark, Monique in her kitchen. */
  night: boolean;
  /** Day 2 with the dig ready: rösti on the table, Raymond in the corner with his thermos. */
  eveningTwo: boolean;
  /** Day 3 evening: the café unlit, the stübli lit only by the monitor. Jumpscare 2. */
  eveningThree: boolean;
  /** Friday morning, back from the bunker: the last call. */
  endingMorning: boolean;
  /** Supper on the table: the first two evenings, before the meal. */
  supper: 'soup' | 'rosti' | null;
}

export function dressInn(state: GameState): InnDressing {
  const phase = storyPhase(state);
  const night = isNight(phase);
  const day = dayOf(state);
  const eveningTwo = !night && isDayTwoEvening(state);
  const supperOne = !night && day === 1 && state.hasFlag('abbe_told_graves') && !state.hasFlag('dinner_day1');
  return {
    phase,
    day,
    night,
    eveningTwo,
    eveningThree: !night && isDayThreeEvening(state),
    endingMorning: !night && isEndingMorning(state),
    supper: supperOne ? 'soup' : eveningTwo ? 'rosti' : null,
  };
}

/** Whether it's dark outside the windows: every night, and the third evening. */
export const darkOutside = (dressing: InnDressing): boolean => dressing.night || dressing.eveningThree;

/** Whether the café lamps burn. Off at night and on the third evening, when Monique has gone through. */
export const cafeLit = (dressing: InnDressing): boolean => !dressing.night && !dressing.eveningThree;
