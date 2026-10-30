import { describe, expect, it } from 'vitest';
import { bedOutcome, innStage, isDayThreeEvening, isDayTwoEvening } from './story';

const state = (counts: Record<string, number>, flags: string[] = [], items: string[] = []) => ({
  count: (name: string) => counts[name] ?? 0,
  hasFlag: (flag: string) => flags.includes(flag),
  hasItem: (item: string) => items.includes(item),
});

describe('bedOutcome', () => {
  it('refuses by day', () => {
    expect(bedOutcome(state({ day: 1 }))).toEqual({ kind: 'refuse', node: 'room_bed' });
    expect(bedOutcome(state({ day: 2 }))).toEqual({ kind: 'refuse', line: 'Not yet. I need to know more first.' });
  });

  it('ends night 1 into day 2', () => {
    expect(bedOutcome(state({ day: 1, night: 1 }))).toEqual({ kind: 'sleep', wake: 2, leftOpen: false });
  });

  it('holds night 2 until the coffin is open, and notes a grave left open', () => {
    expect(bedOutcome(state({ day: 2, night: 2 })).kind).toBe('refuse');
    expect(bedOutcome(state({ day: 2, night: 2 }, ['opened_coffin']))).toEqual({ kind: 'sleep', wake: 3, leftOpen: true });
    expect(bedOutcome(state({ day: 2, night: 2 }, ['opened_coffin', 'grave_refilled']))).toEqual({ kind: 'sleep', wake: 3, leftOpen: false });
  });

  it('never sleeps on night 3', () => {
    expect(bedOutcome(state({ day: 3, night: 3 })).kind).toBe('refuse');
  });
});

describe('evenings', () => {
  it('day 2 needs the shovel and two coffin clues', () => {
    expect(isDayTwoEvening(state({ day: 2 }, ['read_register', 'odile_talked']))).toBe(false);
    expect(isDayTwoEvening(state({ day: 2 }, ['read_register', 'odile_talked'], ['shovel']))).toBe(true);
    expect(isDayTwoEvening(state({ day: 2 }, ['read_register', 'odile_talked', 'dinner_day2'], ['shovel']))).toBe(false);
  });

  it('day 3 comes after the forest grave, or after the call with the food', () => {
    expect(isDayThreeEvening(state({ day: 3 }, ['editor_called']))).toBe(false);
    expect(isDayThreeEvening(state({ day: 3 }, ['editor_called'], ['food_parcel']))).toBe(true);
    expect(isDayThreeEvening(state({ day: 3 }, ['found_forest_grave']))).toBe(true);
    expect(isDayThreeEvening(state({ day: 3 }, ['found_forest_grave', 'met_veilleur']))).toBe(false);
  });
});

describe('innStage', () => {
  it('follows the days, with stage 5 only in the evening', () => {
    expect(innStage(state({}), false)).toBe(1);
    expect(innStage(state({ day: 2 }), false)).toBe(2);
    expect(innStage(state({ day: 2 }, ['found_hidden_door']), false)).toBe(3);
    expect(innStage(state({ day: 3 }, ['found_forest_grave']), false)).toBe(4);
    expect(innStage(state({ day: 3 }), true)).toBe(5);
  });
});
