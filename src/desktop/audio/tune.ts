/**
 * Note data for the MIDI file on Stef's homepage: an invented 80s synth-pop loop in A minor.
 * Each bar is eight eighth-note steps. A note name starts a note, `-` holds the previous note,
 * and `.` is a rest.
 */

export interface NoteEvent {
  step: number;
  steps: number;
  midi: number;
}

export const tuneTempo = 118;
export const stepsPerBar = 8;

export const lead = [
  'A4 . C5 . E5 . D5 C5',
  'B4 . G4 . A4 - - .',
  'A4 . C5 . E5 . G5 E5',
  'F5 - E5 . D5 - - .',
  'C5 . D5 . E5 . A5 .',
  'G5 . E5 . D5 . C5 .',
  'B4 . C5 . D5 . E5 -',
  'E5 - - - . . . .',
].join(' ');

export const bass = ['A2 A3', 'G2 G3', 'A2 A3', 'D2 D3', 'F2 F3', 'C2 C3', 'G2 G3', 'E2 E3']
  .map((pair) => Array(4).fill(pair).join(' '))
  .join(' ');

const semitones: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "A4" to MIDI note 69. Sharps are written "F#4". */
export function midiNote(name: string): number {
  const match = /^([A-G])(#?)(\d)$/.exec(name);
  if (!match) throw new Error(`Bad note "${name}"`);
  return 12 * (Number(match[3]) + 1) + semitones[match[1]!]! + (match[2] ? 1 : 0);
}

export function parseTrack(track: string): NoteEvent[] {
  const tokens = track.split(/\s+/).filter(Boolean);
  return tokens.reduce<NoteEvent[]>((events, token, step) => {
    if (token === '-') {
      const last = events[events.length - 1];
      if (last && last.step + last.steps === step) last.steps++;
    } else if (token !== '.') {
      events.push({ step, steps: 1, midi: midiNote(token) });
    }
    return events;
  }, []);
}

export function frequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}
