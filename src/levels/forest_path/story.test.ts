import { describe, expect, it } from 'vitest';
import type { TimeOfDay } from '../../game/state';
import { storyPhase } from './story';

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
