/**
 * How the farm animals notice the reporter. The dog lifts its head when they come near and
 * lays it down again once they have been gone a while; only the first time does it make a
 * sound. The cows turn to look one after another, the longer the reporter stands by the stall.
 */

export interface Dog {
  /** Head up, watching. */
  up: boolean;
  /** Has woken once already this visit. */
  woke: boolean;
  /** Seconds the reporter has been out of range while the dog watches. */
  away: number;
}

export const restingDog: Dog = { up: false, woke: false, away: 0 };

/** Seconds out of range before the head goes down again. */
const SETTLE = 10;

/** One frame of the dog. `first` is true on the frame it wakes for the first time. */
export function dogStep(dog: Dog, distance: number, dt: number, wakeAt: number): { dog: Dog; first: boolean } {
  if (!dog.up) return distance < wakeAt ? { dog: { up: true, woke: true, away: 0 }, first: !dog.woke } : { dog, first: false };
  const away = distance > wakeAt * 1.5 ? dog.away + dt : 0;
  return { dog: { ...dog, up: away < SETTLE, away: away < SETTLE ? away : 0 }, first: false };
}

/**
 * Seconds the reporter has stood within `reach`, counted down three times as fast when they
 * walk off, so a cow that turned keeps looking a moment after they leave.
 */
export function nearFor(previous: number, distance: number, dt: number, reach: number): number {
  return distance < reach ? previous + dt : Math.max(0, previous - dt * 3);
}

/** Which cows look, each after its own delay in seconds of the reporter standing near. */
export function cowsLooking(near: number, delays: readonly number[]): boolean[] {
  return delays.map((delay) => near > delay);
}
