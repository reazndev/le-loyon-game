import { describe, expect, it } from 'vitest';
import { GameState } from '../game/state';
import { checkStory, derived, derivedFlags, expandDerived, holds, storyFlags } from './flags';

describe('derived flags', () => {
  it('suspects_empty_coffin needs two of the three coffin clues', () => {
    const state = new GameState();
    state.setFlag('read_register');
    expect(derived.suspects_empty_coffin(state)).toBe(false);
    state.setFlag('odile_talked');
    expect(derived.suspects_empty_coffin(state)).toBe(true);
  });

  it('has_evidence holds for the letter or any strong photo, not a weak one', () => {
    const state = new GameState();
    state.giveItem('photo_grave_chassot');
    expect(derived.has_evidence(state)).toBe(false);
    state.giveItem('photo_forest_grave');
    expect(derived.has_evidence(state)).toBe(true);
    const letter = new GameState();
    letter.giveItem('gremaud_letter');
    expect(derived.has_evidence(letter)).toBe(true);
  });

  it('item flags follow the inventory', () => {
    const state = new GameState();
    state.giveItem('food_parcel');
    expect(holds('has_food', state)).toBe(true);
    state.takeItem('food_parcel');
    expect(holds('has_food', state)).toBe(false);
    expect(holds('has_shovel', state)).toBe(false);
  });

  it('pro_knows_village needs all three prologue clues', () => {
    const state = new GameState();
    ['pro_read_thread_bus', 'pro_read_homepage'].forEach((f) => state.setFlag(f));
    expect(derived.pro_knows_village(state)).toBe(false);
    state.setFlag('pro_read_guestbook');
    expect(derived.pro_knows_village(state)).toBe(true);
  });

  it('holds reads stored flags directly', () => {
    const state = new GameState();
    state.setFlag('met_marc');
    expect(holds('met_marc', state)).toBe(true);
  });
});

describe('expandDerived', () => {
  it('leaves conditions without derived flags alone', () => {
    expect(expandDerived({ flag: 'met_marc', notFlag: 'caught' })).toEqual({ flag: 'met_marc', notFlag: 'caught' });
  });

  it('replaces derived flags and their negations', () => {
    expect(expandDerived({ flag: ['met_marc', 'has_shovel'], notFlag: 'has_food' })).toEqual({
      all: [{ flag: 'met_marc' }, { item: 'shovel' }, { not: { item: 'food_parcel' } }],
    });
  });

  it('expands nested conditions', () => {
    expect(expandDerived({ not: { flag: 'has_ring' } })).toEqual({ not: { all: [{}, { item: 'ring' }] } });
  });

  it('lets checkStory test derived flags with the plain state', () => {
    const state = new GameState();
    state.giveItem('shovel');
    expect(checkStory({ flag: 'has_shovel', notFlag: 'has_evidence' }, state)).toBe(true);
    expect(checkStory(undefined, state)).toBe(true);
  });
});

describe('flags the game uses', () => {
  // Test scenes and unit tests use made-up flags on purpose.
  const sources = import.meta.glob<string>(['../levels/**/*.ts', '../game/**/*.ts', '../desktop/**/*.ts', '!**/*.test.ts', '!../levels/test/**', '!../levels/characters_test/**'], {
    query: '?raw',
    import: 'default',
    eager: true,
  });
  const used = Object.entries(sources).flatMap(([file, text]) =>
    [...text.matchAll(/(?:setFlag\(|hasFlag\(|holds\(|set: |flag: |notFlag: )\[?'([a-z0-9_]+)'/g)].map((m) => ({ file, flag: m[1]! })),
  );

  it('declares every flag the levels set or read', () => {
    const known = new Set<string>([...storyFlags, ...Object.keys(derivedFlags)]);
    expect(used.length).toBeGreaterThan(50);
    expect(used.filter(({ flag }) => !known.has(flag))).toEqual([]);
  });
});
