import { describe, expect, it } from 'vitest';
import { choiceText, displayLine } from './displayLine';

describe('displayLine', () => {
  it('moves a translation onto its own line', () => {
    expect(displayLine('Raymond', "Bouge pas! {{Don't move!}}")).toEqual({
      speaker: 'Raymond',
      text: 'Bouge pas!',
      translation: "Don't move!",
      narration: false,
    });
  });

  it('keeps the English that follows the French', () => {
    expect(displayLine('Monique', "Bonsoir. {{Good evening.}} You're the one who phoned?")).toMatchObject({
      text: "Bonsoir. You're the one who phoned?",
      translation: 'Good evening.',
    });
  });

  it('treats a line without a speaker as narration', () => {
    expect(displayLine(undefined, 'The lantern is dark. Cold wax.')).toEqual({
      text: 'The lantern is dark. Cold wax.',
      narration: true,
    });
  });

  it('strips translations from choices', () => {
    expect(choiceText('Merci. {{Thank you.}}')).toBe('Merci.');
  });
});
