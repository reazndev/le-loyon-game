import { describe, expect, it } from 'vitest';
import { GameState } from '../game/state';
import { knowsVillage, notesText, recordRead } from './progress';

describe('village clues', () => {
  it('solves P1 only when all three pages are read, and only once', () => {
    const state = new GameState();
    expect(recordRead(state, 'pro_read_thread_bus')).toBe(false);
    expect(recordRead(state, 'pro_read_homepage')).toBe(false);
    expect(knowsVillage(state)).toBe(false);
    expect(recordRead(state, 'pro_read_guestbook')).toBe(true);
    expect(state.hasFlag('pro_knows_village')).toBe(true);
    expect(recordRead(state, 'pro_read_guestbook')).toBe(false);
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
    recordRead(state, 'pro_read_guestbook');
    expect(notesText(state)).toContain('"yann". says LEURS.');
    expect(notesText(state)).not.toContain('PostBus. 4 a day');
    recordRead(state, 'pro_read_thread_bus');
    recordRead(state, 'pro_read_homepage');
    const lines = notesText(state).split('\n');
    expect(lines.indexOf('- PostBus. 4 a day. last one 18:52.')).toBeLessThan(lines.indexOf('- someone who lives there: "yann". says LEURS.'));
    expect(lines.slice(-4)).toEqual(['', 'LEURS (FR). PostBus from the station. Inn: Croix-Blanche.', 'They call him "Le Loyon".', 'Three days. Go.']);
  });
});
