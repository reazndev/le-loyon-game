import { describe, expect, it } from 'vitest';
import { apply, check } from './conditions';
import { GameState } from './state';

describe('counts in conditions and effects', () => {
  it('compares counts, treating unset counts as 0', () => {
    const state = new GameState();
    expect(check({ count: [['marc_trust', '==', 0]] }, state)).toBe(true);
    state.setCount('marc_trust', 2);
    expect(check({ count: [['marc_trust', '>=', 2]] }, state)).toBe(true);
    expect(check({ count: [['marc_trust', '>', 2]] }, state)).toBe(false);
    expect(check({ count: [['marc_trust', '<', 2]] }, state)).toBe(false);
    expect(check({ count: [['marc_trust', '<=', 2]] }, state)).toBe(true);
    expect(check({ count: [['marc_trust', '!=', 2]] }, state)).toBe(false);
  });

  it('needs every count test to hold', () => {
    const state = new GameState();
    state.setCount('day', 2);
    expect(check({ count: [['day', '>=', 2], ['night', '==', 0]] }, state)).toBe(true);
    state.setCount('night', 2);
    expect(check({ count: [['day', '>=', 2], ['night', '==', 0]] }, state)).toBe(false);
  });

  it('assigns before it adds', () => {
    const state = new GameState();
    state.setCount('marc_trust', 3);
    apply({ assign: { marc_trust: 0 }, add: { marc_trust: 1, film_shots: -1 } }, state);
    expect(state.count('marc_trust')).toBe(1);
    expect(state.count('film_shots')).toBe(-1);
  });
});

describe('all', () => {
  it('holds only when every condition holds', () => {
    const state = new GameState();
    state.setFlag('a');
    const both = { all: [{ flag: 'a' }, { not: { flag: 'b' } }] };
    expect(check(both, state)).toBe(true);
    state.setFlag('b');
    expect(check(both, state)).toBe(false);
  });
});

describe('counts in the game state', () => {
  it('survive a snapshot and restore', () => {
    const state = new GameState();
    state.setCount('day', 3);
    const copy = new GameState();
    copy.restore(state.snapshot());
    expect(copy.count('day')).toBe(3);
  });

  it('start empty when restoring a snapshot from before counts existed', () => {
    const state = new GameState();
    state.setCount('day', 3);
    const { counts: _, ...old } = new GameState().snapshot();
    state.restore(old);
    expect(state.count('day')).toBe(0);
  });

  it('emit an event only on change', () => {
    const state = new GameState();
    const seen: number[] = [];
    state.events.on('count', ({ value }) => seen.push(value));
    state.setCount('night', 1);
    state.setCount('night', 1);
    expect(seen).toEqual([1]);
  });
});
