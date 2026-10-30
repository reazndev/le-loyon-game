import { describe, expect, it } from 'vitest';
import { notebook, notebookGoals } from '../content';
import { currentGoal, notebookDocument, unlockedNotes } from './notebook';
import { GameState } from './state';

describe('notebook', () => {
  it('starts with no notes, only the first step', () => {
    const state = new GameState();
    expect(unlockedNotes(state)).toEqual([]);
    expect(notebookDocument(state).pages).toEqual([currentGoal(state)]);
  });

  it('puts the next step above the notes', () => {
    const state = new GameState();
    state.setFlag('arrived');
    const [first] = notebookDocument(state).pages;
    expect(first!.startsWith(`${currentGoal(state)}\n\nLeurs.`)).toBe(true);
  });

  it('adds a note for each flag, in story order', () => {
    const state = new GameState();
    state.setFlag('met_gilles');
    state.setFlag('arrived');
    expect(unlockedNotes(state)).toEqual([notebook.arrived.text, notebook.met_gilles.text]);
  });

  it("checks an entry's own condition", () => {
    const state = new GameState();
    state.setFlag('read_chronicle');
    expect(unlockedNotes(state)).toEqual([]);
    state.setFlag('read_register');
    expect(unlockedNotes(state)).toContain(notebook.read_chronicle.text);
  });

  it('follows derived flags', () => {
    const state = new GameState();
    state.setFlag('read_register');
    state.setFlag('odile_talked');
    expect(unlockedNotes(state)).toContain(notebook.suspects_empty_coffin.text);
  });

  it('fits every note on pages of the document view', () => {
    const state = new GameState();
    Object.keys(notebook).forEach((flag) => state.setFlag(flag));
    state.setFlag('bernard_light_coffin');
    const pages = notebookDocument(state).pages;
    expect(pages.length).toBeGreaterThan(1);
    pages.forEach((page) => expect(page.split('\n').length).toBeLessThanOrEqual(10));
  });
});

describe('notebook goals', () => {
  /** A state at some point of the story: counts first, then flags and items. */
  const at = (counts: Record<string, number>, flags: string[] = [], items: string[] = []) => {
    const state = new GameState();
    Object.entries(counts).forEach(([name, value]) => state.setCount(name, value));
    flags.forEach((flag) => state.setFlag(flag));
    items.forEach((item) => state.giveItem(item));
    return state;
  };
  const dayOne = ['arrived', 'inn_checked_in', 'abbe_met', 'abbe_told_graves', 'dinner_day1'];
  const graves = ['read_grave_menoud', 'read_grave_gremaud', 'read_grave_chassot', 'met_raymond'];
  const dayTwo = [...dayOne, ...graves, 'first_sighting', 'found_bunker', 'bunker_door_wedged'];
  const nightTwo = [...dayTwo, 'read_register', 'heifer_returned', 'bernard_light_coffin', 'dinner_day2'];
  const dayThree = [...nightTwo, 'opened_coffin', 'read_gremaud_letter', 'grave_refilled'];
  const goal = (state: GameState) => currentGoal(state) ?? '';

  it('walks the reporter from the bus to the phone', () => {
    const stages = [
      at({ day: 1 }, ['arrived']),
      at({ day: 1 }, ['arrived', 'inn_checked_in']),
      at({ day: 1 }, ['arrived', 'inn_checked_in', 'abbe_told_graves']),
      at({ day: 1, night: 1 }, dayOne),
      at({ day: 1, night: 1 }, [...dayOne, ...graves]),
      at({ day: 1, night: 1 }, [...dayOne, ...graves, 'first_sighting']),
      at({ day: 1, night: 1 }, [...dayOne, ...graves, 'first_sighting', 'found_bunker']),
      at({ day: 2 }, dayTwo),
      at({ day: 2 }, [...dayTwo, 'read_register']),
      at({ day: 2 }, [...dayTwo, 'read_register', 'odile_talked']),
      at({ day: 2 }, [...dayTwo, 'read_register', 'odile_talked', 'heifer_returned', 'bernard_light_coffin']),
      at({ day: 2 }, [...dayTwo, 'read_register', 'odile_talked'], ['shovel']),
      at({ day: 2 }, [...dayTwo, 'read_register', 'odile_talked', 'found_hidden_door'], ['shovel']),
      at({ day: 2, night: 2 }, nightTwo, ['shovel']),
      at({ day: 2, night: 2 }, [...nightTwo, 'opened_coffin'], ['shovel']),
      at({ day: 2, night: 2 }, [...nightTwo, 'opened_coffin'], ['shovel', 'bunker_key']),
      at({ day: 2, night: 2 }, [...nightTwo, 'opened_coffin', 'grave_refilled'], ['bunker_key']),
      at({ day: 3 }, dayThree, ['bunker_key']),
      at({ day: 3 }, [...dayThree, 'found_forest_grave'], ['bunker_key']),
      at({ day: 3 }, [...dayThree, 'found_forest_grave'], ['bunker_key', 'food_parcel']),
      at({ day: 3, night: 3 }, [...dayThree, 'found_forest_grave', 'met_veilleur'], ['bunker_key']),
      at({ day: 3, night: 3 }, [...dayThree, 'found_forest_grave', 'met_veilleur', 'entered_hidden_room'], ['bunker_key']),
      at({ day: 3, night: 3 }, [...dayThree, 'found_forest_grave', 'met_veilleur', 'entered_hidden_room', 'met_marc']),
      at({ day: 4 }, [...dayThree, 'found_forest_grave', 'met_veilleur', 'entered_hidden_room', 'met_marc']),
    ].map(goal);
    expect(stages.every((text) => text !== '')).toBe(true);
    // Each step of the story moves the goal on.
    stages.slice(1).forEach((text, i) => expect(text).not.toBe(stages[i]));
  });

  it('tells a player who only has the clues to find a spade', () => {
    const state = at({ day: 2 }, [...dayTwo, 'read_register', 'odile_talked']);
    expect(goal(state)).toMatch(/^Tonight\. The Chassot grave\. Need a spade\./);
  });

  it('opens day 3 on the larch unless the evening has already come', () => {
    expect(goal(at({ day: 3 }, dayThree))).toMatch(/larch/);
    expect(goal(at({ day: 3 }, [...dayThree, 'editor_called'], ['food_parcel']))).toMatch(/^Back to the inn/);
  });

  it('uses every goal at some point', () => {
    expect(new Set(notebookGoals.map((g) => g.text)).size).toBe(notebookGoals.length);
  });
});
