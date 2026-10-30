import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'bernard_day1' },
  { if: { flag: 'heifer_found', notFlag: 'heifer_returned', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'bernard_heifer_back' },
  { if: { notFlag: 'heifer_returned', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'bernard_day2' },
  { if: { flag: 'heifer_returned', notFlag: 'has_shovel' }, to: 'bernard_shovel' },
  { if: { count: [['day', '==', 2], ['night', '==', 0]] }, to: 'bernard_day2_after' },
  { if: { flag: 'grave_left_open', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'bernard_day3_open' },
  { if: { count: [['day', '==', 3], ['night', '==', 0]] }, to: 'bernard_day3' },
];

export const nodes = {
  bernard_day1: {
    speaker: speakers.bernard,
    effects: { set: 'heifer_missing' },
    lines: [
      'Oui? {{Yes?}}',
      "A journalist. Good for you. I've got a heifer out somewhere in this soup and it's getting dark.",
    ],
    choices: [
      { text: 'Can I help?', next: 'bernard_day1_help' },
      { text: 'Do you know anything about Le Loyon?', next: 'bernard_day1_loyon' },
    ],
  },
  bernard_day1_help: {
    speaker: speakers.bernard,
    lines: ["In the dark? You'd walk into the river. Come back in the morning if you're serious."],
  },
  bernard_day1_loyon: {
    speaker: speakers.bernard,
    lines: [
      "I know a fox takes my eggs. That's what I know.",
      'Bonsoir.',
    ],
  },
  bernard_day2: {
    speaker: speakers.bernard,
    lines: [
      'Still not back. Marquise. Brown, white face, a bell.',
      "She'll be up by the forest. They go up there and stand like idiots. I can't walk that far today.",
    ],
    choices: [
      { text: "I'll go and look.", next: 'bernard_day2_go' },
      { text: 'Could I borrow a shovel?', next: 'bernard_shovel_ask' },
    ],
  },
  bernard_day2_go: {
    speaker: speakers.bernard,
    lines: ['Through the gate behind the shed, straight up the field. Follow the fence. Shut the gate.'],
  },
  bernard_shovel_ask: {
    speaker: speakers.bernard,
    lines: [
      'A shovel. For what?',
      "No. Not with that cow still out there. Ask me when she's home.",
    ],
  },
  bernard_heifer_back: {
    speaker: speakers.bernard,
    effects: { set: 'heifer_returned' },
    lines: ['There she is. Stupid animal.'],
    next: 'bernard_heifer_back.2',
  },
  'bernard_heifer_back.2': {
    lines: ["He runs a hand down the heifer's neck. She is shivering."],
    next: 'bernard_heifer_back.3',
  },
  'bernard_heifer_back.3': {
    speaker: speakers.bernard,
    lines: ['Where was she?'],
    choices: [
      { text: 'At the forest edge, staring into the trees.', next: 'bernard_heifer_staring' },
      { text: 'Up the field. By the fence.', next: 'bernard_heifer_staring' },
    ],
  },
  bernard_heifer_staring: {
    speaker: speakers.bernard,
    lines: [
      "They do that. Since last year. Something in there they don't like.",
      "Merci. {{Thank you.}} You've earned a coffee. Come inside.",
    ],
    next: 'bernard_kitchen',
  },
  bernard_kitchen: {
    lines: [
      'A low kitchen. A wood stove. A crucifix and a calendar from the cattle insurance.',
      'He pours coffee and a splash of something clear.',
    ],
    next: 'bernard_kitchen.2',
  },
  'bernard_kitchen.2': {
    speaker: speakers.bernard,
    lines: ["You were at the abbé's. You're asking about the Chassot boy."],
    choices: [
      { text: 'You carried his coffin.', next: 'bernard_coffin' },
      { text: 'What happened to him?', next: 'bernard_coffin' },
    ],
  },
  bernard_coffin: {
    speaker: speakers.bernard,
    effects: { set: 'bernard_light_coffin' },
    lines: [
      "November '95. Four of us. Me, Gilles from the garage, Raymond the watchman, and Daniel Menoud.",
      'The syndic brought the coffin up from the valley in a van. Sealed. "From the French."',
      'We lifted it and Daniel looked at me. I looked at him. Nobody said anything.',
      'It was light. Like lifting a door.',
    ],
    choices: [
      { text: 'What did you think was in it?', next: 'bernard_coffin_2' },
      { text: "Why didn't anyone ask?", next: 'bernard_coffin_2' },
    ],
  },
  bernard_coffin_2: {
    speaker: speakers.bernard,
    lines: [
      "A man burned up in a war, what's left? I told myself that.",
      "His mother was standing right there. You don't ask, with the mother there.",
      'And the syndic said it was in order. Jean-Pierre always said things were in order.',
    ],
    next: 'bernard_eggs',
  },
  bernard_eggs: {
    speaker: speakers.bernard,
    lines: [
      'The fox takes my eggs. Two, three a week.',
      "Sometimes there's a coin in the straw. Five francs. Two francs.",
      "Foxes don't pay.",
    ],
    next: 'bernard_eggs.2',
  },
  'bernard_eggs.2': {
    lines: ["He drinks. He doesn't look at me."],
  },
  bernard_shovel: {
    speaker: speakers.bernard,
    effects: { give: 'shovel' },
    lines: [
      'You wanted a shovel.',
      'In the shed, on the left. Bring it back clean.',
      "And I don't want to know.",
    ],
    next: 'bernard_shovel.2',
  },
  'bernard_shovel.2': {
    lines: ['The shovel has a worn ash handle and a blade sharpened with a file.'],
  },
  bernard_day2_after: {
    speaker: speakers.bernard,
    lines: ["Shovel's in your hand. I didn't see you take it."],
  },
  bernard_day3: {
    speaker: speakers.bernard,
    lines: [
      'Marquise ate this morning. First time in three days.',
      'You keep the shovel till you go.',
      { if: { flag: 'read_register' }, text: 'My wife liked you people. Newspapers. She read every page.' },
    ],
  },
  bernard_day3_open: {
    speaker: speakers.bernard,
    lines: [
      'Raymond found the grave open.',
      'Leave my shovel against the shed when you go. Clean.',
      "I lent it to someone to plant a tree. That's what I'll say.",
    ],
  },
} satisfies Record<string, ScriptNode>;
