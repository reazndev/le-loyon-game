/**
 * chu_clock: the tower clock's heavy click every quarter hour, and the bell on the hour. Play
 * time is compressed, so a quarter hour passes in QUARTER_SECONDS.
 */

export const QUARTER_SECONDS = 75;
/** The first click comes soon after the player walks in, so they learn the sound early. */
export const FIRST_QUARTER = 20;

export type Chime = 'quarter' | 'hour';

/** The chimes due after scene time `from` up to and including `to`, in order. */
export function chimesBetween(from: number, to: number): Chime[] {
  const quarterAt = (t: number) => (t < FIRST_QUARTER ? 0 : Math.floor((t - FIRST_QUARTER) / QUARTER_SECONDS) + 1);
  const chimes: Chime[] = [];
  for (let k = quarterAt(from) + 1; k <= quarterAt(to); k++) chimes.push(k % 4 === 0 ? 'hour' : 'quarter');
  return chimes;
}
