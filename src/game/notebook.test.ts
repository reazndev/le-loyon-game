import { describe, expect, it } from 'vitest';
import { notebook } from '../content';
import { notebookDocument, unlockedNotes } from './notebook';
import { GameState } from './state';

describe('notebook', () => {
  it('starts empty', () => {
    const state = new GameState();
    expect(unlockedNotes(state)).toEqual([]);
    expect(notebookDocument(state).pages).toEqual(['Nothing yet. A clean page.']);
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
