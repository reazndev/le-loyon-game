import type { StateMutator, StateView } from '../game/conditions';

/** Puzzle P1: the three pages that together name the village. */
export const villageClues = ['pro_read_thread_bus', 'pro_read_homepage', 'pro_read_guestbook'] as const;

export function knowsVillage(state: StateView): boolean {
  return villageClues.every((flag) => state.hasFlag(flag));
}

/**
 * Sets a reading flag. When it completes the three clues, also sets `pro_knows_village` and
 * returns true, once.
 */
export function recordRead(state: StateMutator, flag: string): boolean {
  if (state.hasFlag(flag)) return false;
  state.setFlag(flag);
  if (state.hasFlag('pro_knows_village') || !knowsVillage(state)) return false;
  state.setFlag('pro_knows_village');
  return true;
}

const notesStart = [
  'STRANGE SWITZERLAND - ideas',
  '- the "Dahu" again? no. done in 1996.',
  '- lights over the lake. boring. weather balloons.',
  '- gas mask man, Fribourg? saw something on that board. check.',
];

const notesByClue: Record<(typeof villageClues)[number], string> = {
  pro_read_thread_bus: '- PostBus. 4 a day. last one 18:52.',
  pro_read_homepage: '- Stef\'s photos. bunker? chapel? village name ends "-urs"',
  pro_read_guestbook: '- someone who lives there: "yann". says LEURS.',
};

const notesSolved = ['', 'LEURS (FR). PostBus from the station. Inn: Croix-Blanche.', 'They call him "Le Loyon".', 'Three days. Go.'];

/** The reporter's notes.txt, which grows as they read the clues. */
export function notesText(state: StateView): string {
  return [
    ...notesStart,
    ...villageClues.filter((flag) => state.hasFlag(flag)).map((flag) => notesByClue[flag]),
    ...(state.hasFlag('pro_knows_village') ? notesSolved : []),
  ].join('\n');
}
