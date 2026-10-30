import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'christine_day1' },
  { if: { notFlag: 'christine_daniel_hint', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'christine_day2' },
  { if: { notFlag: 'has_food', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'christine_day3' },
  { to: 'christine_shop' },
];

export const nodes = {
  christine_day1: {
    speaker: speakers.christine,
    lines: ["Bonsoir. We're closing in ten minutes, but go on."],
    choices: [
      { text: "I'm a journalist. I'm asking about Le Loyon.", next: 'christine_day1_loyon' },
      { text: 'Just looking.', next: 'christine_shop' },
    ],
  },
  christine_day1_loyon: {
    speaker: speakers.christine,
    lines: [
      "I sell milk and bread. I don't sell stories.",
      "If you go up to the cemetery, my brother's there. Daniel. Second row.",
      "Somebody lights his lantern every Saturday. It isn't me.",
    ],
    choices: [
      { text: 'Who, then?', next: 'christine_day1_who' },
    ],
  },
  christine_day1_who: {
    speaker: speakers.christine,
    lines: ["If I find out, I'll thank them. That's all."],
  },
  christine_day2: {
    speaker: speakers.christine,
    lines: ['You went to see Daniel. Raymond told me. People tell me everything at the milk counter.'],
    choices: [
      { text: 'What was he like?', next: 'christine_daniel_1' },
      { text: 'Was he close to Marc Chassot?', if: { flag: 'abbe_told_graves' }, next: 'christine_daniel_marc' },
    ],
  },
  christine_daniel_1: {
    speaker: speakers.christine,
    lines: [
      'Funny. Clever with machines. Hopeless with money.',
      'The farm went wrong after his divorce. Then he went quiet. We thought it was the winter.',
      'Nobody here says the word depression. We say "he\'s tired."',
      'He was tired for a long time.',
    ],
    next: 'christine_daniel_marc',
  },
  christine_daniel_marc: {
    speaker: speakers.christine,
    effects: { set: 'christine_daniel_hint' },
    lines: [
      'Marc and Daniel. You never saw one without the other, when they were boys.',
      "When Marc left, Daniel didn't speak to anyone for a month.",
      'The last year, Daniel went walking on Sundays. Up into Bois-Noir. Every Sunday.',
      'Once at supper he said, "Marc isn\'t dead, you know." Then he laughed. So I laughed.',
      'Three weeks later...',
    ],
    next: 'christine_daniel_marc.2',
  },
  'christine_daniel_marc.2': {
    lines: ["She straightens the bread on the counter. It doesn't need straightening."],
    next: 'christine_daniel_marc.3',
  },
  'christine_daniel_marc.3': {
    speaker: speakers.christine,
    lines: ['Do you want something? Bread?'],
  },
  christine_day3: {
    speaker: speakers.christine,
    lines: ["You look like you're going on a walk."],
    choices: [
      { text: 'Bread and cheese, please. Enough for two.', next: 'christine_food' },
      { text: 'Nothing, thanks.', next: 'christine_shop' },
    ],
  },
  christine_food: {
    speaker: speakers.christine,
    effects: { give: 'food_parcel' },
    lines: [
      'Pain mi-blanc. Gruyère, the salé, it keeps. {{Half-white bread. Salty Gruyère.}}',
      'Eight francs forty.',
    ],
    next: 'christine_food.2',
  },
  'christine_food.2': {
    lines: ["She wraps it in paper and doesn't ask who the second person is."],
  },
  christine_shop: {
    speaker: speakers.christine,
    lines: ["Bread, milk, Gruyère, cigarettes, batteries. That's the shop."],
  },
} satisfies Record<string, ScriptNode>;
