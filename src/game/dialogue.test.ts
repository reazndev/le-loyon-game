import { describe, expect, it } from 'vitest';
import { DialogueRunner, validateScript, type DialogueScript } from './dialogue';
import { GameState } from './state';

const priest: DialogueScript = {
  start: [{ if: { flag: 'met_priest' }, to: 'again' }, { to: 'hello' }],
  nodes: {
    hello: {
      speaker: 'Abbé Overney',
      lines: ['Good evening.', 'You are not from Leurs.'],
      effects: { set: 'met_priest' },
      choices: [
        { text: 'Ask about the cemetery', next: 'cemetery' },
        { text: 'Show him the photo', if: { item: 'photo' }, next: 'photo' },
        { text: 'Leave' },
      ],
    },
    again: { speaker: 'Abbé Overney', lines: ['Back again?'] },
    cemetery: {
      speaker: 'Abbé Overney',
      lines: ['Take this. The gate sticks.'],
      effects: { give: 'cemetery_key' },
      next: 'bye',
    },
    photo: { lines: ['He looks at it for a long time.'], effects: { take: 'photo', set: 'showed_photo' } },
    bye: { lines: [], next: [{ if: { item: 'cemetery_key' }, to: 'farewell' }] },
    farewell: { speaker: 'Abbé Overney', lines: ['Go with God.'] },
  },
};

describe('DialogueRunner', () => {
  it('shows lines in order, with the choices on the last line', () => {
    const runner = new DialogueRunner(priest, new GameState());
    expect(runner.step).toEqual({ kind: 'line', speaker: 'Abbé Overney', text: 'Good evening.' });
    expect(runner.advance()).toEqual({
      kind: 'choice',
      speaker: 'Abbé Overney',
      text: 'You are not from Leurs.',
      choices: ['Ask about the cemetery', 'Leave'],
    });
  });

  it('applies node effects on entry and picks the start jump by flag', () => {
    const state = new GameState();
    new DialogueRunner(priest, state);
    expect(state.hasFlag('met_priest')).toBe(true);
    expect(new DialogueRunner(priest, state).step).toMatchObject({ text: 'Back again?' });
  });

  it('shows choices whose conditions hold and applies their effects', () => {
    const state = new GameState();
    state.giveItem('photo');
    const runner = new DialogueRunner(priest, state);
    const choices = runner.advance();
    expect(choices).toMatchObject({ choices: ['Ask about the cemetery', 'Show him the photo', 'Leave'] });
    expect(runner.choose(1)).toMatchObject({ kind: 'line', text: 'He looks at it for a long time.' });
    expect(state.hasItem('photo')).toBe(false);
    expect(state.hasFlag('showed_photo')).toBe(true);
    expect(runner.advance()).toEqual({ kind: 'end' });
  });

  it('follows jumps through empty nodes and conditional next lists', () => {
    const state = new GameState();
    const runner = new DialogueRunner(priest, state);
    runner.advance();
    expect(runner.choose(0)).toMatchObject({ text: 'Take this. The gate sticks.' });
    expect(state.hasItem('cemetery_key')).toBe(true);
    expect(runner.advance()).toMatchObject({ text: 'Go with God.' });
    expect(runner.advance()).toEqual({ kind: 'end' });
  });

  it('ends when a choice has no next', () => {
    const runner = new DialogueRunner(priest, new GameState());
    runner.advance();
    expect(runner.choose(1)).toEqual({ kind: 'end' });
  });

  it('ignores advance during a choice and choose during a line', () => {
    const runner = new DialogueRunner(priest, new GameState());
    expect(runner.choose(0)).toMatchObject({ kind: 'line', text: 'Good evening.' });
    const choice = runner.advance();
    expect(runner.advance()).toBe(choice);
    expect(runner.choose(9)).toBe(choice);
  });

  it('shows choices on a node with no lines', () => {
    const runner = new DialogueRunner(
      { start: 'ask', nodes: { ask: { lines: [], choices: [{ text: 'Yes' }] } } },
      new GameState(),
    );
    expect(runner.step).toEqual({ kind: 'choice', speaker: undefined, text: undefined, choices: ['Yes'] });
  });

  it('throws on a jump to a missing node', () => {
    expect(() => new DialogueRunner({ start: 'nowhere', nodes: {} }, new GameState())).toThrow(/nowhere/);
  });
});

describe('validateScript', () => {
  it('accepts a script whose jumps all resolve', () => {
    expect(validateScript(priest)).toEqual([]);
  });

  it('reports missing targets', () => {
    expect(
      validateScript({
        start: 'a',
        nodes: { a: { lines: ['x'], next: 'b', choices: [{ text: 'Go', next: [{ to: 'c' }] }] } },
      }),
    ).toEqual(['a jumps to missing node "b"', 'a choice "Go" jumps to missing node "c"']);
  });
});
