import { describe, expect, it } from 'vitest';
import { checkStory } from '../../content';
import { steps } from './steps';

const state = (counts: Record<string, number>, flags: string[] = [], items: string[] = []) => ({
  count: (name: string) => counts[name] ?? 0,
  hasFlag: (flag: string) => flags.includes(flag),
  hasItem: (item: string) => items.includes(item),
});

const holding = (view: ReturnType<typeof state>) => Object.entries(steps).filter(([, condition]) => checkStory(condition, view)).map(([name]) => name);

describe('steps', () => {
  it('holds the step the notebook shows', () => {
    const cases: [ReturnType<typeof state>, string][] = [
      [state({ day: 1 }), 'checkIn'],
      [state({ day: 1 }, ['inn_checked_in', 'abbe_told_graves']), 'village'],
      [state({ day: 1, night: 1 }, ['first_sighting']), 'graves'],
      [state({ day: 1, night: 1 }, ['first_sighting', 'read_grave_menoud', 'read_grave_gremaud', 'read_grave_chassot']), 'follow'],
      [state({ day: 2 }, ['read_register']), 'widow'],
      [state({ day: 2 }, ['read_register', 'odile_talked', 'heifer_missing']), 'heifer'],
      [state({ day: 2 }, ['read_register', 'odile_talked', 'heifer_missing', 'heifer_returned']), 'spade'],
      [state({ day: 2 }, ['read_register', 'odile_talked', 'found_bunker'], ['shovel']), 'searchBunker'],
      [state({ day: 3 }), 'larch'],
    ];
    cases.forEach(([view, name]) => expect(holding(view)).toEqual([name]));
  });

  it('never holds two steps at once', () => {
    const nights = [0, 1, 2, 3];
    const flags = [[], ['read_register'], ['read_register', 'odile_talked'], ['met_marc']];
    nights.forEach((night) => flags.forEach((set) => expect(holding(state({ day: 2, night }, set)).length).toBeLessThanOrEqual(1)));
  });
});
