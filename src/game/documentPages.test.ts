import { describe, expect, it } from 'vitest';
import { documents } from '../content';
import { documentLook, documentPages } from './documentPages';

describe('documentPages', () => {
  it('pairs pages one to one when both have the same length', () => {
    const pages = documentPages({ title: 'Letter', pages: ['a', 'b'], translation: ['A', 'B'] }, 'paper');
    expect(pages.map((p) => [p.text, p.translation])).toEqual([
      ['a', 'A'],
      ['b', 'B'],
    ]);
    expect(pages.map((p) => `${p.page + 1}/${p.pages}`)).toEqual(['1/2', '2/2']);
  });

  it('shows every page of the longer side and spreads the shorter one', () => {
    const pages = documentPages({ title: 'Diary', pages: ['a'], translation: ['A', 'B', 'C'] }, 'paper');
    expect(pages.map((p) => [p.text, p.translation])).toEqual([
      ['a', 'A'],
      ['a', 'B'],
      ['a', 'C'],
    ]);
    const longer = documentPages({ title: 'Register', pages: ['a', 'b', 'c', 'd'], translation: ['A', 'B'] }, 'paper');
    expect(longer.map((p) => p.translation)).toEqual(['A', 'A', 'B', 'B']);
  });

  it('leaves out the translation of an English document', () => {
    const [page] = documentPages({ title: 'Note', pages: ['text'] }, 'paper');
    expect(page).not.toHaveProperty('translation');
  });

  it('reads every content document', () => {
    Object.entries(documents).forEach(([id, document]) => {
      const pages = documentPages(document, documentLook(id));
      expect(pages.length).toBeGreaterThan(0);
      pages.forEach((page) => expect(page.text.split('\n').length).toBeLessThanOrEqual(10));
    });
  });

  it('carves graves and old stones', () => {
    expect(documentLook('grave_chassot')).toBe('stone');
    expect(documentLook('oldstone_3')).toBe('stone');
    expect(documentLook('doc_gremaud_letter')).toBe('paper');
  });
});
