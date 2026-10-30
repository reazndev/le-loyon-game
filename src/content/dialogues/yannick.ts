import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { flag: 'met_veilleur' }, to: 'yannick_after' },
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'yannick_day1' },
  { if: { count: [['day', '==', 2], ['night', '==', 0]] }, to: 'yannick_day2' },
  { if: { notFlag: 'met_veilleur', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'yannick_day3' },
];

export const nodes = {
  yannick_day1: {
    speaker: speakers.yannick,
    lines: [
      '...',
      'Salut. {{Hi.}}',
    ],
    next: 'yannick_day1.2',
  },
  'yannick_day1.2': {
    lines: ["He goes back to the brake disc he's cleaning. He doesn't look up again."],
  },
  yannick_day2: {
    speaker: speakers.yannick,
    lines: ['You went into the forest.'],
    choices: [
      { text: 'How do you know?', next: 'yannick_day2_b' },
      { text: 'Have you seen him? Le Loyon?', next: 'yannick_day2_b' },
    ],
  },
  yannick_day2_b: {
    speaker: speakers.yannick,
    lines: [
      'Everybody knows everything here.',
      'I have to work.',
    ],
  },
  yannick_day3: {
    speaker: speakers.yannick,
    lines: ['Not now.'],
    next: 'yannick_day3.2',
  },
  'yannick_day3.2': {
    lines: ['He walks off fast, hands in his pockets.'],
  },
  yannick_reveal: {
    speaker: speakers.yannick,
    effects: { set: 'met_veilleur' },
    lines: [
      "Sorry. Sorry. I didn't mean... I was going to say something.",
      "It's me. Veilleur. The posts.",
    ],
    choices: [
      { text: "You've been following me.", next: 'yannick_reveal_follow' },
      { text: 'You wrote in Stef\'s guestbook. "yann".', next: 'yannick_reveal_guestbook' },
    ],
  },
  yannick_reveal_follow: {
    speaker: speakers.yannick,
    lines: [
      "Only at night. I wanted to see what you'd do.",
      'Nobody goes into the forest. You just walked in.',
    ],
    next: 'yannick_reveal_seen',
  },
  yannick_reveal_guestbook: {
    speaker: speakers.yannick,
    lines: ["Yeah. People were making fun of him. Like he's a monster in a film."],
    next: 'yannick_reveal_seen',
  },
  yannick_reveal_seen: {
    speaker: speakers.yannick,
    lines: [
      "I've seen him. Six times. Seven.",
      'Once he was standing in our yard at three in the morning, by the bins. Just standing.',
      "He looked up at my window. I didn't move. He didn't move. Then he went.",
    ],
    choices: [
      { text: 'Are you scared of him?', next: 'yannick_reveal_scared' },
      { text: 'Who do you think he is?', next: 'yannick_reveal_who' },
    ],
  },
  yannick_reveal_scared: {
    speaker: speakers.yannick,
    lines: [
      'No. Yes. Not like that.',
      "He's like... someone who got lost and never stopped walking.",
    ],
    next: 'yannick_reveal_end',
  },
  yannick_reveal_who: {
    speaker: speakers.yannick,
    lines: [
      "The old men say it's Marc Chassot. Then they laugh, like it's a joke.",
      "Gilles doesn't laugh.",
    ],
    next: 'yannick_reveal_end',
  },
  yannick_reveal_end: {
    speaker: speakers.yannick,
    lines: [
      "You're going up tonight. To the barn.",
      "Don't bring the gendarmes. Please.",
      "And don't tell my mother I said please.",
    ],
  },
  yannick_after: {
    speaker: speakers.yannick,
    lines: ["I won't follow you tonight. Promise."],
  },
} satisfies Record<string, ScriptNode>;
