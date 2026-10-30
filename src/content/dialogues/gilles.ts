import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { notFlag: 'met_gilles', count: [['day', '==', 1], ['night', '==', 0]] }, to: 'gilles_day1' },
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'gilles_day1_again' },
  { if: { notFlag: 'knows_legion', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'gilles_day2' },
  { if: { count: [['day', '==', 2], ['night', '==', 0]] }, to: 'gilles_day2_again' },
  { if: { flag: 'grave_left_open', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'gilles_day3_open' },
  { if: { count: [['day', '==', 3], ['night', '==', 0]] }, to: 'gilles_day3' },
];

export const nodes = {
  gilles_day1: {
    speaker: speakers.gilles,
    effects: { set: 'met_gilles' },
    lines: [
      'The journalist. Monique said.',
      "Sit if you want. I'm not going to tell you a ghost story.",
    ],
    choices: [
      { text: 'What do people mean by Le Loyon?', next: 'gilles_day1_loyon' },
      { text: 'Have you seen him?', next: 'gilles_day1_seen' },
    ],
  },
  gilles_day1_loyon: {
    speaker: speakers.gilles,
    lines: [
      'A man in the woods with a mask. Some say a tramp. Some say a farmer with a grudge.',
      "The old ones make a joke of it. That's what people do here.",
    ],
    next: 'gilles_day1_seen',
  },
  gilles_day1_seen: {
    speaker: speakers.gilles,
    lines: [
      'Once. Last winter. Driving back from Romont at night, I came round by the cemetery.',
      'He was standing at a grave. Not doing anything. Staring at it.',
      "I stopped the car. He turned his head. That's all. Turned his head.",
      'I drove home.',
    ],
    choices: [
      { text: 'Which grave?', next: 'gilles_day1_which' },
      { text: 'Thank you.', next: 'gilles_day1_end' },
    ],
  },
  gilles_day1_which: {
    speaker: speakers.gilles,
    lines: [
      'The back row. Against the forest.',
      "Go and look. It won't take you long. There aren't many of us up there yet.",
    ],
  },
  gilles_day1_end: {
    speaker: speakers.gilles,
    lines: ['Santé. {{Cheers.}}'],
  },
  gilles_day1_again: {
    speaker: speakers.gilles,
    lines: ['Back row. Against the forest.'],
  },
  gilles_day2: {
    speaker: speakers.gilles,
    lines: ["You're the one who walked into Bois-Noir at night. Yannick told me. Yannick tells me everything."],
    choices: [
      { text: 'Did you know Marc Chassot?', next: 'gilles_marc_1' },
      { text: 'Do you have a key to the old bunker?', next: 'gilles_bunker' },
      { text: "Have you seen Bernard's heifer?", if: { flag: 'heifer_missing', notFlag: 'heifer_returned' }, next: 'gilles_heifer' },
    ],
  },
  gilles_marc_1: {
    speaker: speakers.gilles,
    lines: [
      "We did recruit school together. Summer '77, in Bière. Artillery.",
      'He was the best shot in the company. He hated every minute of it.',
      'His father died that winter. Marc sold the cows, had a fight with half the village, and left in March.',
    ],
    next: 'gilles_marc_2',
  },
  gilles_marc_2: {
    speaker: speakers.gilles,
    effects: { set: 'knows_legion', give: 'postcard_calvi' },
    lines: ['One card came. Then nothing.'],
    next: 'gilles_marc_2.2',
  },
  'gilles_marc_2.2': {
    lines: [
      "He reaches over the bench and unpins a postcard from the wall. It's faded blue. A harbor, a citadel.",
    ],
    next: 'gilles_marc_2.3',
  },
  'gilles_marc_2.3': {
    speaker: speakers.gilles,
    lines: ["Calvi. Corsica. You know who's in Calvi?"],
    choices: [
      { text: 'No.', next: 'gilles_marc_3' },
      { text: 'The Foreign Legion.', next: 'gilles_marc_3' },
    ],
  },
  gilles_marc_3: {
    speaker: speakers.gilles,
    lines: [
      'The Legion. The paratroopers.',
      "You can't say it here. A Swiss in a foreign army, that's prison. His mother never said the word.",
      "Keep the card. I've looked at it long enough.",
    ],
    next: 'gilles_marc_4',
  },
  gilles_marc_4: {
    speaker: speakers.gilles,
    lines: [
      "When they buried him in '95, I was a bearer. With Bernard and Raymond. And Daniel.",
      'Ask Bernard about that coffin. Not me.',
    ],
  },
  gilles_bunker: {
    speaker: speakers.gilles,
    lines: [
      'Nobody has a key. The syndic had them. Jean-Pierre. The keys went where he went.',
      "The kids get in somehow. The front's never locked, the steel door inside is. Was.",
    ],
  },
  gilles_heifer: {
    speaker: speakers.gilles,
    lines: [
      "Marquise? She'll be up at the forest edge above his field. They always go up there in fog. Don't ask me why.",
    ],
  },
  gilles_day2_again: {
    speaker: speakers.gilles,
    lines: ['Ask Bernard about the coffin.'],
  },
  gilles_day3: {
    speaker: speakers.gilles,
    lines: [
      'You look like someone who found something.',
      "Don't tell me. I've had three years of not knowing. I'm used to it.",
    ],
  },
  gilles_day3_open: {
    speaker: speakers.gilles,
    lines: [
      "Somebody dug up Marc's grave last night.",
      'Raymond says the coffin was empty. Not a bone. Nothing.',
      "He's been sitting in the café since six with his hands shaking.",
    ],
    next: 'gilles_day3_open.2',
  },
  'gilles_day3_open.2': {
    lines: ['Gilles looks at my boots for a long time.'],
    next: 'gilles_day3_open.3',
  },
  'gilles_day3_open.3': {
    speaker: speakers.gilles,
    lines: [
      'I carried that box. I knew. I always knew it was too light.',
      "Whatever you're doing, finish it before the gendarmes come.",
    ],
  },
} satisfies Record<string, ScriptNode>;
