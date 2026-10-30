/**
 * The weather over Leurs, the same in every scene at a given point of the story, so the
 * village, the forest, and the fort agree. Night 1 is dry and still; on night 2 a drizzle sets in
 * and stays; night 3 adds wind. By day the wind rises a little each day.
 */

export interface Weather {
  /** Fine rain, outdoors, and on roofs and windows indoors. */
  drizzle: boolean;
  /** 0 to 1, for `windInTrees` and `windSway`. */
  wind: number;
  /** Cold enough to see the reporter's breath outdoors. */
  breath: boolean;
}

export function weather(state: { time: 'day' | 'night'; count(name: string): number }): Weather {
  if (state.time === 'night') {
    const night = Math.max(1, state.count('night'));
    return { drizzle: night >= 2, wind: night >= 3 ? 0.7 : 0.35, breath: true };
  }
  const day = Math.max(1, state.count('day'));
  return { drizzle: false, wind: Math.min(0.3 + (day - 1) * 0.15, 0.6), breath: false };
}
