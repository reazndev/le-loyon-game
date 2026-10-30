import { describe, expect, it } from 'vitest';
import { documents } from '../../content';
import { DialogueRunner } from '../../game/dialogue';
import { GameState } from '../../game/state';
import { bookTitled, CLOSE_CUPBOARD, shelf } from './registers';

describe('the register shelf', () => {
  it('offers every book by its title, and a way out', () => {
    const step = new DialogueRunner(shelf, new GameState()).step;
    expect(step.kind === 'choice' && step.choices).toEqual(['Burials, 1995', 'Burials, 1996', 'Burials, 1997', 'Baptisms, 1958', 'Parish chronicle', CLOSE_CUPBOARD]);
  });

  it('maps each title to its book and flag', () => {
    expect(bookTitled(documents.doc_register_1995.title)).toEqual({ doc: 'doc_register_1995', sets: 'read_register' });
    expect(bookTitled(CLOSE_CUPBOARD)).toBeUndefined();
    expect(bookTitled(null)).toBeUndefined();
  });
});
