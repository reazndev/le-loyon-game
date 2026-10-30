import { describe, expect, it } from 'vitest';
import { DialogueRunner, validateScript } from '../../game/dialogue';
import { GameState } from '../../game/state';
import { registerMenu } from './registers';

/** Picks a choice by its text, then pages through until the next choice or the end. */
function pick(runner: DialogueRunner, text: string) {
  const step = runner.step;
  if (step.kind !== 'choice') throw new Error('No choice on screen');
  let next = runner.choose(step.choices.indexOf(text));
  while (next.kind === 'line') next = runner.advance();
  return next;
}

describe('registerMenu', () => {
  it('has no jumps to missing nodes', () => {
    expect(validateScript(registerMenu())).toEqual([]);
  });

  it('sets read_register after the 1995 burials and returns to the shelf', () => {
    const state = new GameState();
    const runner = new DialogueRunner(registerMenu(), state);
    expect(pick(runner, 'Burials, 1996').kind).toBe('choice');
    expect(state.hasFlag('read_register')).toBe(false);
    pick(runner, 'Burials, 1995');
    expect(state.hasFlag('read_register')).toBe(true);
    pick(runner, 'Parish chronicle');
    expect(state.hasFlag('read_chronicle')).toBe(true);
    expect(pick(runner, 'Close the cupboard.').kind).toBe('end');
  });
});
