import { describe, expect, it } from 'vitest';
import { bass, lead, midiNote, parseTrack, stepsPerBar } from './tune';

describe('tune', () => {
  it('names notes the MIDI way', () => {
    expect(midiNote('A4')).toBe(69);
    expect(midiNote('C4')).toBe(60);
    expect(midiNote('F#2')).toBe(42);
  });

  it('holds notes across dashes and skips rests', () => {
    expect(parseTrack('A4 - . C5')).toEqual([
      { step: 0, steps: 2, midi: 69 },
      { step: 3, steps: 1, midi: 72 },
    ]);
  });

  it('has eight bars in each track', () => {
    expect(lead.split(/\s+/)).toHaveLength(8 * stepsPerBar);
    expect(bass.split(/\s+/)).toHaveLength(8 * stepsPerBar);
  });
});
