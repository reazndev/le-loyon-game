import { describe, expect, it } from 'vitest';
import { RandomEvents, type RandomEventId } from './randomEvents';

/** Runs for `seconds` in 1 s frames and collects the events. */
function run(events: RandomEvents, seconds: number, blocked = false): RandomEventId[] {
  return Array.from({ length: seconds }, () => events.update(1, blocked)).filter((e): e is RandomEventId => e !== null);
}

describe('RandomEvents', () => {
  it('keeps the minimum gap between events', () => {
    const events = new RandomEvents({ gap: 75, chance: 1, window: 10 }, () => 0);
    const times: number[] = [];
    for (let t = 1; t <= 400; t++) if (events.update(1)) times.push(t);
    expect(times.length).toBeGreaterThan(2);
    times.slice(1).forEach((t, i) => expect(t - times[i]!).toBeGreaterThanOrEqual(75));
  });

  it('rolls the chance once per window', () => {
    const rolls: number[] = [];
    const events = new RandomEvents({ gap: 0, chance: 0.5, window: 10 }, () => {
      rolls.push(1);
      return 0.9;
    });
    expect(run(events, 100)).toHaveLength(0);
    expect(rolls).toHaveLength(10);
  });

  it('holds back while blocked and for a set time after a beat', () => {
    const events = new RandomEvents({ gap: 0, chance: 1, window: 1 }, () => 0);
    expect(run(events, 20, true)).toHaveLength(0);
    events.block(30);
    expect(run(events, 29)).toHaveLength(0);
    expect(run(events, 5).length).toBeGreaterThan(0);
  });

  it('never plays the same event three times running, and respects limits', () => {
    const events = new RandomEvents({ gap: 0, chance: 1, window: 1, pool: [{ id: 'step', weight: 1 }, { id: 'breath', weight: 0.01, limit: 1 }] }, () => 0);
    const played = run(events, 9);
    expect(played.slice(0, 3)).toEqual(['step', 'step', 'breath']);
    expect(played.filter((e) => e === 'breath')).toHaveLength(1);
  });
});
