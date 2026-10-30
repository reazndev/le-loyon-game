import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { flag: 'has_minet' }, to: 'germaine_minet_back' },
  { if: { notFlag: 'germaine_met' }, to: 'germaine_day1' },
  { if: { flag: 'heard_minet', notFlag: 'cellar_code_hint' }, to: 'germaine_cellar' },
  { if: { flag: 'josiane_letterbox', notFlag: 'germaine_letterbox' }, to: 'germaine_letterbox' },
  { if: { flag: 'minet_returned' }, to: 'germaine_after' },
  { to: 'germaine_again' },
];

export const nodes = {
  germaine_day1: {
    speaker: speakers.germaine,
    effects: { set: ['germaine_met', 'minet_missing'] },
    lines: [
      "Bonjour. You're looking at Thérèse's house. They all come and look at it now. Since the internet.",
      'Have you seen a cat? Tabby, white socks. Minet. Five days.',
    ],
    choices: [
      { text: 'Whose house was it?', next: 'germaine_chassot' },
      { text: "I'll keep an eye out.", next: 'germaine_again' },
    ],
  },
  germaine_chassot: {
    speaker: speakers.germaine,
    lines: [
      "Thérèse Chassot's. My Ernest's niece. He's up the hill now, with her.",
      "Her boy went to the army in France, and they sent him home in a box. Then she went too. Nobody's opened that door since.",
      "Somebody keeps her garden. I don't ask. My ears are no good and my eyes are worse.",
    ],
  },
  germaine_again: {
    speaker: speakers.germaine,
    lines: ["Minet, Minet. Five days. He's never been gone five days.", 'If you see him, he comes to his name. When he wants to.'],
  },
  farm_mewing: {
    effects: { set: 'heard_minet' },
    lines: [
      'Under the house. A cat, mewing, thin and angry. It comes up through a grating by the cellar hatch.',
      'The hatch has a padlock with four brass wheels.',
    ],
  },
  germaine_cellar: {
    speaker: speakers.germaine,
    effects: { set: 'cellar_code_hint' },
    lines: [
      "Under the house? In Thérèse's cellar? Mon Dieu. He goes in by the grating after the mice, and now he can't get out.",
      "It's locked. Her padlock with the little wheels.",
      "She used the boy's birthday for everything. The bicycle lock, the cellar, her post office book.",
      "The day and the month, the way you write them on a letter. Don't ask me which.",
      "I was at his baptism and I can't tell you.",
      'The church books will know. They know everybody.',
    ],
  },
  germaine_minet_back: {
    speaker: speakers.germaine,
    effects: { set: 'minet_returned', take: 'minet' },
    lines: ['Minet ! Espèce de sale bête. {{Minet! You dirty animal.}}'],
    next: 'germaine_minet_back.2',
  },
  'germaine_minet_back.2': {
    lines: ['She takes him in both arms. He lets her.'],
    next: 'germaine_minet_back.3',
  },
  'germaine_minet_back.3': {
    speaker: speakers.germaine,
    lines: ['In the cellar. Of course. Was it... was it tidy, down there?'],
    choices: [
      { text: "Somebody's been taking the potatoes.", next: 'germaine_potatoes' },
      { text: 'Just the cat.', next: 'germaine_thanks' },
    ],
  },
  germaine_potatoes: {
    speaker: speakers.germaine,
    lines: ["Then somebody's eating. Good. Nothing should rot in that house."],
    next: 'germaine_step',
  },
  germaine_step: {
    speaker: speakers.germaine,
    lines: [
      "I'll tell you something. I told the abbé, and he only held my hand.",
      'The week before Thérèse died, I was sitting with her. It was June, the window was open.',
      'She said, "That\'s Marc in the garden. I know his step."',
      'Then she said, "He drags it now. Why does he drag his foot?"',
      'Marc never dragged a foot in his life. He ran everywhere. We said it was the morphine.',
    ],
    next: 'germaine_step.2',
  },
  'germaine_step.2': {
    lines: ["She strokes the cat. She doesn't look at the farm."],
    next: 'germaine_thanks',
  },
  germaine_thanks: {
    speaker: speakers.germaine,
    lines: ["Merci. Come for coffee on Sunday, if you're still here."],
  },
  germaine_letterbox: {
    speaker: speakers.germaine,
    effects: { set: 'germaine_letterbox' },
    lines: ["The letterbox? Thérèse's? I haven't put a finger on it since the funeral."],
    next: 'germaine_letterbox.2',
  },
  'germaine_letterbox.2': {
    lines: ['She looks across the road at the farm for a long time.'],
    next: 'germaine_letterbox.3',
  },
  'germaine_letterbox.3': {
    speaker: speakers.germaine,
    lines: ['Then who?'],
  },
  germaine_after: {
    speaker: speakers.germaine,
    lines: ["He's asleep on the stove. He's forgotten all about it. Cats."],
  },

  // A8: the Chassot cellar.
  cellar_lock_look: {
    lines: ["A brass padlock with four little wheels. Old, but oiled. The hasp is shiny where it's been opened."],
  },
  cellar_lock_wrong_3: {
    if: { flag: 'cellar_code_hint' },
    lines: ["I'm guessing. His birthday, she said. Day and month."],
  },
  cellar_lock_wrong_3_blind: {
    if: { notFlag: 'cellar_code_hint' },
    lines: ["Four numbers. I don't even know whose."],
  },
  cellar_lock_night: {
    if: { count: [['night', '>=', 1]] },
    lines: ['Not at night. Not in there.'],
  },
  cellar_open: {
    effects: { set: 'opened_cellar' },
    lines: ['The shackle drops. Cold air comes up the steps, smelling of earth and apples.'],
  },
  cellar_bin: {
    lines: ['Potatoes in a slatted bin. The top layer has been taken, carefully, from one side. The soil on the floor is fresh.'],
  },
  cellar_jars: {
    lines: [
      'Jars on a shelf, labeled in a round old hand. "Poires 1995." "Prunes 1995." Her last summer of jam.',
      'Half the row is gone. Clean rings in the dust where they stood.',
    ],
  },
  cellar_blanket_look: {
    lines: [],
    next: [{ if: { notFlag: ['has_minet', 'minet_returned'] }, to: 'cellar_blanket' }, { to: 'cellar_blanket_after' }],
  },
  cellar_blanket: {
    lines: ['An army blanket folded on a crate. Gray wool, stenciled in black: BOIS-NOIR.', 'Minet has made a nest in it, and glares at me.'],
  },
  cellar_blanket_after: {
    lines: ['An army blanket folded on a crate. Gray wool, stenciled in black: BOIS-NOIR. Cat hair all over it now.'],
  },
  cellar_candle: {
    lines: ["A jam jar with a candle stub in it, burned down to a finger's width. Army matches beside it in a brown box."],
  },
  cellar_marks: {
    lines: [
      'Pencil lines on the frame of the inside stair door, each with a date.',
      '"Marc 1964." "Marc 1968." "Marc 1974", level with my eyes.',
      'After that, nothing.',
    ],
  },
  cellar_stair: {
    lines: ['The stair up into the house. The door at the top is shut. No dust on the steps.'],
  },
  cellar_minet: {
    if: { notFlag: ['has_minet', 'minet_returned'] },
    effects: { give: 'minet' },
    lines: ["A tabby with white socks. He spits at me, and then he's purring against my coat. Minet."],
  },

  // A9: the hatch.
  cellar_stick: {
    lines: ['The stick that held the hatch open. Rotten through. It just gave.'],
  },
} satisfies Record<string, ScriptNode>;
