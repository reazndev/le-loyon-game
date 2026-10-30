import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'odile_day1' },
  { if: { notFlag: 'read_register', count: [['day', '>=', 2], ['night', '==', 0]] }, to: 'odile_closed' },
  { if: { flag: 'read_register', notFlag: 'odile_talked', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'odile_talk' },
  { if: { flag: ['read_gremaud_letter', 'found_forest_grave'], count: [['day', '==', 3], ['night', '==', 0]] }, to: 'odile_day3_knows' },
  { to: 'odile_after' },
];

export const nodes = {
  odile_day1: {
    speaker: speakers.odile,
    lines: ['Oui?'],
    choices: [
      { text: "I'm a journalist. Could I ask about your husband?", next: 'odile_day1_no' },
    ],
  },
  odile_day1_no: {
    speaker: speakers.odile,
    lines: ['No.'],
    next: 'odile_day1_no.2',
  },
  'odile_day1_no.2': {
    lines: ['The door shuts. The lock turns twice.'],
  },
  odile_closed: {
    lines: ['A curtain moves upstairs. Nobody comes to the door.'],
  },
  odile_talk: {
    speaker: speakers.odile,
    lines: [
      'The abbé phoned. He said you might come, and that I could decide.',
      'Come in. Wipe your feet.',
    ],
    next: 'odile_talk_2',
  },
  odile_talk_2: {
    speaker: speakers.odile,
    lines: [
      'They all want to know if he ran away. Twenty-six years syndic, and they ask me that.',
      { if: { flag: 'read_baptism' }, text: 'He was our godson, you know. Marc. We never had children.' },
    ],
    choices: [
      { text: 'What happened that night?', next: 'odile_night' },
      { text: 'Was anything different, before?', next: 'odile_before' },
    ],
  },
  odile_night: {
    speaker: speakers.odile,
    lines: [
      'The fourteenth of January. Snow all day. He put his boots on after the news.',
      "He said he was going to look at the commune's wood in Bois-Noir. At ten at night. In snow.",
      'I said, "Jean-Pierre, you\'re sixty-four." He kissed my head and went.',
      "His car's still in the garage. Gilles keeps the battery charged. I don't know why I let him.",
    ],
    next: 'odile_before',
  },
  odile_before: {
    speaker: speakers.odile,
    lines: [
      'That last year he went out two nights a week. Tuesdays and Fridays. Always with the rucksack.',
      'He came back with it empty. Bread gone, cheese gone, sometimes the newspaper.',
      'I thought there was a woman. God forgive me, I would have preferred a woman.',
    ],
    next: 'odile_diary',
  },
  odile_diary: {
    speaker: speakers.odile,
    effects: { set: 'odile_talked', give: 'gremaud_diary' },
    lines: [
      "Here. His diary from '96. The police looked and gave it back. They said it was nothing.",
      "Take it. Bring it back. I can't read it any more.",
    ],
    choices: [
      { text: 'Thank you.', next: 'odile_end' },
      { text: "Do you think he's dead?", next: 'odile_dead' },
    ],
  },
  odile_dead: {
    speaker: speakers.odile,
    lines: [
      "I put up a stone so I'd have somewhere to stand on Sundays.",
      "Yes. I think he's dead. I'd just like to know where.",
    ],
  },
  odile_end: {
    speaker: speakers.odile,
    lines: ['Close the door properly. It sticks.'],
  },
  odile_day3_knows: {
    speaker: speakers.odile,
    lines: ['You came back. Did you read it?'],
    next: 'odile_day3_knows.2',
  },
  'odile_day3_knows.2': {
    lines: ["I think of the cross under the larch. I can't say it. Not before I know who carved it."],
    next: 'odile_day3_knows.3',
  },
  'odile_day3_knows.3': {
    lines: ["Not yet. I'll bring it back tomorrow."],
  },
  odile_after: {
    speaker: speakers.odile,
    lines: ['Did you find anything in it?'],
    choices: [
      { text: 'Not yet.', next: 'odile_end' },
    ],
  },
} satisfies Record<string, ScriptNode>;
