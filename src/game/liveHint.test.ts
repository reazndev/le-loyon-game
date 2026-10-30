import { describe, expect, it } from 'vitest';
import { pickHint, type LiveHint } from './liveHint';
import { GameState } from './state';

describe('pickHint', () => {
  const hints: LiveHint[] = [
    { text: 'whole scene' },
    { text: 'by the gate', near: { x: 0, z: 0, r: 3 } },
    { text: 'after arriving', if: { flag: 'arrived' }, near: { x: 10, z: 0, r: 3 } },
    { text: 'never', when: () => false, near: { x: 0, z: 0, r: 3 } },
  ];

  it('prefers a clue tied to the spot over one for the whole scene', () => {
    expect(pickHint(hints, new GameState(), { x: 1, z: 1 })?.text).toBe('by the gate');
    expect(pickHint(hints, new GameState(), { x: 5, z: 0 })?.text).toBe('whole scene');
  });

  it('skips clues whose story state or live check does not hold', () => {
    const state = new GameState();
    expect(pickHint(hints, state, { x: 10, z: 0 })?.text).toBe('whole scene');
    state.setFlag('arrived');
    expect(pickHint(hints, state, { x: 10, z: 0 })?.text).toBe('after arriving');
  });

  it('gives nothing when no clue applies', () => {
    expect(pickHint([], new GameState(), { x: 0, z: 0 })).toBeNull();
  });
});
