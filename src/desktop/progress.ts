import type { StateMutator, StateView } from '../game/conditions';

/** Puzzle P1: the two pages that tell the reporter where to go and how. */
export const villageClues = ['pro_read_thread_bus', 'pro_read_homepage'] as const;
type VillageClue = (typeof villageClues)[number];

export function knowsVillage(state: StateView): boolean {
  return villageClues.every((flag) => state.hasFlag(flag));
}

/**
 * Sets a reading flag. When it completes the clues, also sets `pro_knows_village` and
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

const notesByClue: Record<VillageClue, string> = {
  pro_read_thread_bus: '- PostBus. 4 a day. last one 18:52.',
  pro_read_homepage: '- Stef\'s photos. the church in photo 3: LEURS.',
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

/** What the reporter still has to find, ticked off under the desktop as each clue is read. */
const checklist: Record<VillageClue, string> = {
  pro_read_thread_bus: 'how to get there',
  pro_read_homepage: 'the village name',
};

/** The steps toward P1 in the order a player meets them, each with the note that points to it. Each fits the strip's one line. */
const hints: [flag: string, hint: string][] = [
  ['pro_read_mail', "Ruth's mail first. Courrier."],
  ['pro_read_board', 'That gas mask story was on the board. Navigator.'],
  ['pro_read_thread_bus', 'The GAS MASK MAN thread. Someone there knows the way.'],
  ['pro_read_homepage', "Cloudy's reply links to Stef's photos."],
];

/** How many of the steps toward P1 are done. A change counts as progress. */
export function progressSteps(state: StateView): number {
  return hints.filter(([flag]) => state.hasFlag(flag)).length;
}

/** The note that points to the first step not done yet, or null once the village is known. */
export function nextHint(state: StateView): string | null {
  if (state.hasFlag('pro_knows_village')) return null;
  return hints.find(([flag]) => !state.hasFlag(flag))?.[1] ?? null;
}

/** The checklist line under the desktop, with `hint` in place of the labels while one shows. */
export function checklistLine(state: StateView, hint: string | null): string {
  if (state.hasFlag('pro_knows_village')) return 'LEURS. Three days. Go. Start > Pack and go';
  const box = (flag: VillageClue) => (state.hasFlag(flag) ? '[x]' : '[ ]');
  if (hint) return `${villageClues.map(box).join('')}  ${hint}`;
  return villageClues.map((flag) => `${box(flag)} ${checklist[flag]}`).join('   ');
}
