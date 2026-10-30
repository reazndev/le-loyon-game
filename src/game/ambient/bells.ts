/**
 * The church of Leurs rings the hours, and every outdoor scene hears it from far off. Play time
 * is compressed as in the church's own clock (`src/levels/church/clock.ts`): an hour passes in
 * five minutes.
 */

export const HOUR_SECONDS = 300;
/** The first hour rings soon after the player arrives, so the sound is part of the place. */
export const FIRST_HOUR = 40;
/** The clock time when a scene opens, as the story has it: late afternoon by day, late evening at night. */
export const START_HOUR = { day: 16, night: 22 } as const;

/** How many hours have rung after `seconds` of scene time. */
export function hoursRung(seconds: number): number {
  return seconds < FIRST_HOUR ? 0 : Math.floor((seconds - FIRST_HOUR) / HOUR_SECONDS) + 1;
}

/** Strokes of the `n`th hour to ring after a scene opens at `startHour`, on a twelve-hour bell. */
export function strokesFor(startHour: number, n: number): number {
  return ((startHour + n - 1) % 12) + 1;
}
