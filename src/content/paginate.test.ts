import { describe, expect, it } from 'vitest';
import { PAGE_LINES, paginate, wrap } from './paginate';

describe('wrap', () => {
  it('leaves short lines alone', () => {
    expect(wrap('Gilles, salut.')).toEqual(['Gilles, salut.']);
  });

  it('breaks long lines at spaces and keeps the indent', () => {
    expect(wrap('  aaa bbb ccc', 9)).toEqual(['  aaa bbb', '  ccc']);
  });

  it('keeps runs of spaces, so columns stay aligned', () => {
    expect(wrap('Mardi 9 janvier       BN')).toEqual(['Mardi 9 janvier       BN']);
    expect(wrap('Mardi    BN. Une longue ligne', 16)).toEqual(['Mardi    BN. Une', 'longue ligne']);
  });

  it('keeps a word longer than the line whole', () => {
    expect(wrap('abcdefghij klm', 5)).toEqual(['abcdefghij', 'klm']);
  });
});

describe('paginate', () => {
  const lines = (n: number, prefix = 'line') => Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`).join('\n');

  it('keeps paragraphs together on one page while they fit', () => {
    expect(paginate('one\ntwo\n\nthree')).toEqual(['one\ntwo\n\nthree']);
  });

  it('moves a paragraph that does not fit to the next page', () => {
    const pages = paginate(`${lines(6, 'a')}\n\n${lines(6, 'b')}`);
    expect(pages).toEqual([lines(6, 'a'), lines(6, 'b')]);
  });

  it('splits a paragraph longer than a page', () => {
    const pages = paginate(lines(PAGE_LINES + 3));
    expect(pages.map((p) => p.split('\n').length)).toEqual([PAGE_LINES, 3]);
  });

  it('starts each section on a new page', () => {
    expect(paginate(['first', 'second'])).toEqual(['first', 'second']);
  });

  it("keeps the columns of Gremaud's diary", () => {
    const diary = 'Mardi 9 janvier       BN\nVendredi 12 janvier   BN. Couvertures.';
    expect(paginate(diary)).toEqual([diary]);
  });

  it('drops blank lines at the edges of a section', () => {
    expect(paginate('\n\n  text\n\n')).toEqual(['  text']);
  });
});
