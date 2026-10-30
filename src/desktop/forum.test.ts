import { describe, expect, it } from 'vitest';
import { GameState } from '../game/state';
import { forumStage } from './forum';

const stateWith = (flags: string[], day = 0, items: string[] = []) => {
  const state = new GameState();
  flags.forEach((flag) => state.setFlag(flag));
  items.forEach((item) => state.giveItem(item));
  if (day) state.setCount('day', day);
  return state;
};

describe('forumStage', () => {
  it('follows the day count', () => {
    expect(forumStage(stateWith([], 1))).toBe(1);
    expect(forumStage(stateWith([], 2))).toBe(2);
    expect(forumStage(stateWith(['found_hidden_door'], 2))).toBe(3);
    expect(forumStage(stateWith([], 2, ['shovel']))).toBe(3);
    expect(forumStage(stateWith([], 3))).toBe(4);
    expect(forumStage(stateWith(['found_forest_grave'], 3))).toBe(5);
  });

  it('infers the day from story flags when the count is unset', () => {
    expect(forumStage(stateWith([]))).toBe(1);
    expect(forumStage(stateWith(['found_bunker']))).toBe(2);
    expect(forumStage(stateWith(['found_bunker', 'has_shovel']))).toBe(3);
    expect(forumStage(stateWith(['opened_coffin']))).toBe(4);
  });
});
