import { describe, expect, it } from 'vitest';
import type { TimeOfDay } from '../../game/state';
import { heiferAtTheFork, storyPhase } from './story';

const state = (time: TimeOfDay, counts: Record<string, number> = {}, flags: string[] = []) => ({
  time,
  count: (name: string) => counts[name] ?? 0,
  hasFlag: (flag: string) => flags.includes(flag),
  hasItem: () => false,
});

describe('storyPhase', () => {
  it('reads the night count at night', () => {
    expect(storyPhase(state('night', { night: 1 }))).toBe('night1');
    expect(storyPhase(state('night', { night: 2 }))).toBe('night2');
    expect(storyPhase(state('night', { night: 3 }))).toBe('night3');
  });

  it('reads the day count by day', () => {
    expect(storyPhase(state('day', { day: 2 }))).toBe('day2');
    expect(storyPhase(state('day', { day: 3 }))).toBe('day3');
  });

  it('treats unset counts as the first day and night', () => {
    expect(storyPhase(state('day'))).toBe('day1');
    expect(storyPhase(state('night'))).toBe('night1');
  });

  it('calls daylight after meeting Marc the dawn', () => {
    expect(storyPhase(state('day', { day: 3 }, ['met_marc']))).toBe('dawn');
  });
});

describe('heiferAtTheFork', () => {
  it('puts Marquise at the fork on day 2 only after skipping the follow', () => {
    expect(heiferAtTheFork(state('day', { day: 2 }, ['skipped_follow']), 'day2')).toBe(true);
    expect(heiferAtTheFork(state('day', { day: 2 }), 'day2')).toBe(false);
    expect(heiferAtTheFork(state('day', { day: 3 }, ['skipped_follow']), 'day3')).toBe(false);
  });

  it('lets her go once she is found', () => {
    expect(heiferAtTheFork(state('day', { day: 2 }, ['skipped_follow', 'heifer_found']), 'day2')).toBe(false);
  });
});
