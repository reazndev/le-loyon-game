import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { notFlag: 'josiane_met' }, to: 'josiane_parcel' },
  { if: { count: [['day', '==', 2], ['night', '==', 0]] }, to: 'josiane_day2' },
  { if: { flag: 'grave_left_open', notFlag: 'josiane_letterbox', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'josiane_day3_open' },
  { if: { notFlag: 'josiane_letterbox', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'josiane_day3' },
  { to: 'josiane_bye' },
];

const lettersChoice = { text: "Who got letters at the syndic's house?", next: 'josiane_letters' };

export const nodes = {
  josiane_parcel: {
    speaker: speakers.josiane,
    effects: { set: 'josiane_met', assign: { film_shots: 10 }, give: 'ruth_note' },
    lines: ["Room three at the Croix-Blanche? That's you. Recorded, from L'Écho. Signez là. {{Sign there.}}"],
    next: 'josiane_parcel.2',
  },
  'josiane_parcel.2': {
    lines: ["A padded envelope. Inside, a film pack for the camera and a card in Ruth's hand. I load the pack. Ten shots."],
    next: 'josiane_parcel.3',
  },
  'josiane_parcel.3': {
    speaker: speakers.josiane,
    lines: ["Nine years on this round and you're the first person who ever got post at the inn."],
    choices: [
      { text: 'Do you know everyone here?', next: 'josiane_round' },
      { text: 'Thanks.', next: 'josiane_bye' },
    ],
  },
  josiane_round: {
    speaker: speakers.josiane,
    lines: ['Leurs, Vauchy, and the farms in between. You learn who gets bills and who gets love letters.'],
    choices: [
      { text: 'Have you ever seen Le Loyon?', next: 'josiane_loyon' },
      { ...lettersChoice, if: { flag: 'abbe_told_graves' } },
      { text: "I'll let you work.", next: 'josiane_bye' },
    ],
  },
  josiane_day2: {
    speaker: speakers.josiane,
    lines: ['Still here? The 18:52 is the last bus. People forget.'],
    choices: [
      { text: 'Have you ever seen Le Loyon?', if: { notFlag: 'josiane_seen' }, next: 'josiane_loyon' },
      { ...lettersChoice, if: { flag: 'abbe_told_graves', notFlag: 'josiane_letters' } },
      { text: 'Bye.', next: 'josiane_bye' },
    ],
  },
  josiane_loyon: {
    speaker: speakers.josiane,
    effects: { set: 'josiane_seen' },
    lines: [
      'I do the Bois-Noir road at six in winter, in the dark.',
      "Twice something has crossed in my lights. Tall, a cape down to here. Not fast. It didn't even look at the van.",
      "Deer don't wear capes. I take the long way now.",
    ],
    choices: [
      { ...lettersChoice, if: { flag: 'abbe_told_graves', notFlag: 'josiane_letters' } },
      { text: 'Thanks.', next: 'josiane_bye' },
    ],
  },
  josiane_letters: {
    speaker: speakers.josiane,
    effects: { set: 'josiane_letters' },
    lines: [
      'Monsieur Gremaud? Council post, mostly. Bills from the canton.',
      'And twice a year, a letter from France. Calvi on the postmark.',
      'Sometimes no town at all, just "Secteur postal" and a number.',
      'Same handwriting every time. Small, careful. A dozen letters, maybe, in my years.',
      "Then in September '95, a big envelope from the French army, recorded.",
      "He signed for it on the step and waited till I'd gone.",
      'After that, nothing from France. Not one.',
      'I used to tease him about a sweetheart in Corsica. I stopped after that.',
    ],
  },
  josiane_day3: {
    lines: [],
    next: [{ if: { flag: 'minet_returned' }, to: 'josiane_cat' }, { to: 'josiane_letterbox_line' }],
  },
  josiane_cat: {
    speaker: speakers.josiane,
    lines: ["Madame Kolly says somebody found her cat. That's one friend in Leurs."],
    next: 'josiane_letterbox_line',
  },
  josiane_day3_open: {
    speaker: speakers.josiane,
    lines: [
      "You heard? Somebody dug at the cemetery last night. Raymond's telephoned Romont.",
      "I'm not asking. I'd take the 13:30, if I were you.",
    ],
    next: 'josiane_letterbox_line',
  },
  josiane_letterbox_line: {
    speaker: speakers.josiane,
    effects: { set: 'josiane_letterbox' },
    lines: [
      "Funny thing. The Chassot farm. Nobody's had post there since Thérèse died.",
      "I still put the commune's leaflets in the box. Every time I come back, they're gone.",
      "Madame Kolly, I suppose. She's like that.",
    ],
  },
  josiane_bye: {
    speaker: speakers.josiane,
    lines: ['À la prochaine. {{See you.}}'],
  },
} satisfies Record<string, ScriptNode>;
