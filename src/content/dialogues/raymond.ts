import { speakers } from '../speakers';
import type { ScriptNode } from './script';

export const nodes = {
  raymond_night1: {
    speaker: speakers.raymond,
    effects: { set: 'met_raymond' },
    lines: [
      "Who's there? Bari, tais-toi! {{Bari, quiet!}}",
      '...',
      "You're the newspaper. From the inn.",
      'What do you want up here at this hour?',
    ],
    choices: [
      { text: "I'm reading the stones.", next: 'raymond_night1_stones' },
      { text: 'Looking for whoever lights the lantern.', next: 'raymond_night1_lantern' },
    ],
  },
  raymond_night1_stones: {
    speaker: speakers.raymond,
    lines: ['In the dark. With a torch. Like a burglar.'],
    next: 'raymond_night1_warn',
  },
  raymond_night1_lantern: {
    speaker: speakers.raymond,
    lines: [
      "Ha. You and me both. A year I've been coming up here.",
      "Every Saturday it's lit. I never see a soul. Not a footprint. Bari doesn't even bark.",
      "Tonight it's lit and it's Tuesday. That's new.",
    ],
    next: 'raymond_night1_warn',
  },
  raymond_night1_warn: {
    speaker: speakers.raymond,
    lines: [
      'Raymond Bapst. I do a round here every night. Nine till two. For the council.',
      "If I find anyone messing with these graves, I call the gendarmes in Romont. I don't care who.",
      'These are my graves. I dug every one of them.',
    ],
    choices: [
      { text: "Even Marc Chassot's?", next: 'raymond_night1_marc' },
      { text: 'Good night.', next: 'raymond_night1_end' },
    ],
  },
  raymond_night1_marc: {
    speaker: speakers.raymond,
    lines: [
      'I dug it. And I carried him. Four of us.',
      '...',
      'Go to bed, journalist.',
    ],
    next: 'raymond_night1_end',
  },
  raymond_night1_end: {
    speaker: speakers.raymond,
    lines: ['Allez, Bari. {{Come on, Bari.}}'],
    next: 'raymond_night1_end.2',
  },
  'raymond_night1_end.2': {
    lines: [
      "His light goes down the path, swinging. The bell on the dog's collar fades out.",
      'Then nothing at all.',
    ],
  },
  raymond_night2_warn: {
    speaker: speakers.raymond,
    if: { notFlag: 'raymond_warned' },
    effects: { set: 'raymond_warned' },
    lines: [
      'You again.',
      'Two nights. People notice.',
      "Go down. If I see you up here again tonight, I'm not asking questions. I'm phoning.",
    ],
    next: 'raymond_night2_warn.2',
  },
  'raymond_night2_warn.2': {
    lines: ["He stands at the gate until I walk out. Then he goes down. I can come back. He'll be faster now."],
  },
  raymond_caught: {
    speaker: speakers.raymond,
    effects: { set: 'caught' },
    lines: [
      "Bouge pas! {{Don't move!}}",
      'Mon Dieu. Mon Dieu, what have you done.',
      'Bari, stay. STAY.',
    ],
    next: 'raymond_caught.2',
  },
  'raymond_caught.2': {
    lines: [
      "He doesn't come closer. He backs to the gate with the torch on me.",
      "Then he's running, as fast as an old man can, down to the phone box.",
      "I could run. Where to? There's one bus, at 6:41.",
    ],
  },
  raymond_day2: {
    speaker: speakers.raymond,
    if: { count: [['day', '==', 2]] },
    lines: [
      'The journalist. Did you sleep?',
      "I didn't. That lantern. Tuesday. It's never been lit on a Tuesday.",
    ],
  },
  raymond_day3_refilled: {
    speaker: speakers.raymond,
    if: { flag: 'grave_refilled', count: [['day', '==', 3]] },
    lines: ["The Chassot grave's soft. Sunk a bit. Rain, I suppose."],
    next: 'raymond_day3_refilled.2',
  },
  'raymond_day3_refilled.2': {
    lines: ['He looks at me for a long time over the thermos.'],
    next: 'raymond_day3_refilled.3',
  },
  'raymond_day3_refilled.3': {
    speaker: speakers.raymond,
    lines: ['Rain.'],
  },
  raymond_day3_open: {
    speaker: speakers.raymond,
    if: { flag: 'grave_left_open', count: [['day', '==', 3]] },
    lines: ['Leave me alone.'],
    next: 'raymond_day3_open.2',
  },
  'raymond_day3_open.2': {
    lines: ["His hands shake on the cup. He doesn't look up. Gilles puts a hand on his shoulder."],
  },
} satisfies Record<string, ScriptNode>;
