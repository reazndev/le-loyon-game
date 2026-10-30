import { describe, expect, it } from 'vitest';
import { GameState } from '../game/state';
import { checklistLine, knowsVillage, nextHint, notesText, progressSteps, recordRead } from './progress';

describe('village clues', () => {
  it('solves P1 only when both pages are read, and only once', () => {
    const state = new GameState();
    expect(recordRead(state, 'pro_read_thread_bus')).toBe(false);
    expect(knowsVillage(state)).toBe(false);
    expect(recordRead(state, 'pro_read_homepage')).toBe(true);
    expect(state.hasFlag('pro_knows_village')).toBe(true);
    expect(recordRead(state, 'pro_read_homepage')).toBe(false);
  });

  it('ignores reads that are not clues', () => {
    const state = new GameState();
    expect(recordRead(state, 'pro_read_board')).toBe(false);
    expect(state.hasFlag('pro_read_board')).toBe(true);
    expect(state.hasFlag('pro_knows_village')).toBe(false);
  });
});

describe('notes.txt', () => {
  it('starts with the ideas list', () => {
    const text = notesText(new GameState());
    expect(text.split('\n')).toHaveLength(4);
    expect(text).toContain('gas mask man, Fribourg?');
  });

  it('adds each clue in script order, then the village', () => {
    const state = new GameState();
    recordRead(state, 'pro_read_homepage');
    expect(notesText(state)).toContain('photo 3: LEURS.');
    expect(notesText(state)).not.toContain('PostBus. 4 a day');
    recordRead(state, 'pro_read_thread_bus');
    const lines = notesText(state).split('\n');
    expect(lines.indexOf('- PostBus. 4 a day. last one 18:52.')).toBeLessThan(lines.indexOf("- Stef's photos. the church in photo 3: LEURS."));
    expect(lines.slice(-4)).toEqual(['', 'LEURS (FR). PostBus from the station. Inn: Croix-Blanche.', 'They call him "Le Loyon".', 'Three days. Go.']);
  });
});

describe('the checklist under the desktop', () => {
  it('ticks each clue as it is read', () => {
    const state = new GameState();
    expect(checklistLine(state, null)).toBe('[ ] how to get there   [ ] the village name');
    recordRead(state, 'pro_read_homepage');
    expect(checklistLine(state, null)).toContain('[x] the village name');
  });

  it('shows a hint in place of the labels, and Pack and go once solved', () => {
    const state = new GameState();
    recordRead(state, 'pro_read_thread_bus');
    expect(checklistLine(state, 'hint')).toBe('[x][ ]  hint');
    recordRead(state, 'pro_read_homepage');
    expect(checklistLine(state, null)).toContain('Pack and go');
  });

  it('points to the first step not done yet', () => {
    const state = new GameState();
    expect(nextHint(state)).toContain('Courrier');
    state.setFlag('pro_read_mail');
    state.setFlag('pro_read_board');
    expect(nextHint(state)).toContain('GAS MASK MAN');
    recordRead(state, 'pro_read_thread_bus');
    expect(nextHint(state)).toContain("Stef's photos");
    expect(progressSteps(state)).toBe(3);
    recordRead(state, 'pro_read_homepage');
    expect(nextHint(state)).toBeNull();
  });
});
