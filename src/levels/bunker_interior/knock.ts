/** A gap of this many seconds or more between knocks counts as a wait. */
export const KNOCK_PAUSE = 2;

/** Groups knock times (seconds) into runs separated by waits: [0, 0.4, 0.8, 3.5] gives [3, 1]. */
export function knockGroups(times: readonly number[], pause = KNOCK_PAUSE): number[] {
  return times.reduce<number[]>((groups, time, i) => {
    if (i > 0 && time - times[i - 1]! < pause) groups[groups.length - 1]! += 1;
    else groups.push(1);
    return groups;
  }, []);
}

/** Gremaud's letter: "Knock three times, wait, then once." */
export const isFriendlyKnock = (times: readonly number[]): boolean => knockGroups(times).join(',') === '3,1';
