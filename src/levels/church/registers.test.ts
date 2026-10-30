import { describe, expect, it } from 'vitest';
import { documents } from '../../content';
import { DialogueRunner } from '../../game/dialogue';
import { GameState } from '../../game/state';
import { bookTitled, burialsGap, burialsInOffice, CLOSE_CUPBOARD, shelf } from './registers';

const onDay = (day: number, flags: string[] = [], items: string[] = []) => {
  const state = new GameState();
  state.setCount('day', day);
  flags.forEach((flag) => state.setFlag(flag));
  items.forEach((item) => state.giveItem(item));
  return state;
};

const choices = (state: GameState) => {
  const step = new DialogueRunner(shelf(state), state).step;
  return step.kind === 'choice' && step.choices;
};

describe('the register shelf', () => {
  it('offers every book by its title, and a way out', () => {
    expect(choices(onDay(3))).toEqual(['Burials, 1995', 'Burials, 1996', 'Burials, 1997', 'Baptisms, 1958', 'Parish chronicle', CLOSE_CUPBOARD]);
  });

  it('leaves the burials out while they are in the office on day 2', () => {
    expect(choices(onDay(2))).toEqual(['Baptisms, 1958', 'Parish chronicle', CLOSE_CUPBOARD]);
    expect(choices(onDay(2, ['simone_printed'], ['burials_book']))).toContain('Burials, 1995');
  });

  it('maps each title to its book and flag', () => {
    expect(bookTitled(documents.doc_register_1995.title)).toMatchObject({ doc: 'doc_register_1995', sets: 'read_register', takes: 'burials_book' });
    expect(bookTitled(CLOSE_CUPBOARD)).toBeUndefined();
    expect(bookTitled(null)).toBeUndefined();
  });
});

describe('the burials gap', () => {
  it('shows from day 2 until the books are back and 1995 is read', () => {
    expect(burialsInOffice(onDay(2))).toBe(true);
    expect(burialsGap(onDay(2, ['simone_printed'], ['burials_book']))).toBe(true);
    expect(burialsInOffice(onDay(2, ['simone_printed']))).toBe(false);
    expect(burialsGap(onDay(2, ['simone_printed', 'read_register']))).toBe(false);
    expect(burialsGap(onDay(3))).toBe(false);
  });
});
