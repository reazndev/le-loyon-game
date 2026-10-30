import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { notFlag: 'abbe_met', count: [['day', '==', 1], ['night', '==', 0]] }, to: 'overney_meet' },
  { if: { flag: 'abbe_told_graves', count: [['day', '==', 1], ['night', '==', 0]] }, to: 'overney_day1_again' },
  { if: { notFlag: 'read_register', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'overney_register_offer' },
  { if: { flag: 'read_register', notFlag: 'abbe_seal_hint', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'overney_seal' },
  { if: { count: [['day', '==', 2], ['night', '==', 0]] }, to: 'overney_day2_again' },
  { if: { flag: 'read_gremaud_letter', notFlag: 'abbe_day3', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'overney_day3_letter' },
  { if: { count: [['day', '==', 3], ['night', '==', 0]] }, to: 'overney_day3' },
  { if: { count: [['night', '>=', 1]] }, to: 'church_locked' },
];

export const nodes = {
  church_locked: {
    lines: ['Locked. In the presbytery next door, a lamp in an upstairs window. A shadow passes it, slowly.'],
  },
  overney_meet: {
    speaker: speakers.overney,
    effects: { set: 'abbe_met' },
    lines: ["Good evening. You're not from the village. I know every coat in Leurs."],
    choices: [
      { text: "I'm a journalist. I'm writing about Le Loyon.", next: 'overney_meet_loyon' },
      { text: 'Just looking at the church.', next: 'overney_meet_church' },
    ],
  },
  overney_meet_church: {
    speaker: speakers.overney,
    lines: [
      "It's not much to look at. But it's warm, which this week is something.",
      "What brings you up here? The truth, please. I'm too old for the other thing.",
    ],
    next: 'overney_meet_loyon',
  },
  overney_meet_loyon: {
    speaker: speakers.overney,
    lines: [
      'Le Loyon. Yes.',
      'People need a name for what frightens them. Give a thing a silly name and you can laugh at it.',
      "I've heard the stories. A man in a mask, at night, at the cemetery.",
    ],
    choices: [
      { text: 'Do you believe them?', next: 'overney_believe' },
      { text: 'Why the cemetery?', next: 'overney_why_cemetery' },
    ],
  },
  overney_believe: {
    speaker: speakers.overney,
    lines: ["I believe people see something. What, I couldn't tell you."],
    next: 'overney_why_cemetery',
  },
  overney_why_cemetery: {
    speaker: speakers.overney,
    lines: [
      'If someone walks among our graves, I suppose he is visiting someone.',
      'We are a small parish. There are three graves up there people whisper about.',
      "Would you like to hear about them? It's a sad hour's talk, but it's the history of this place.",
    ],
    choices: [
      { text: 'Please.', next: 'overney_graves_menoud' },
      { text: 'Another time.', next: 'overney_later' },
    ],
  },
  overney_later: {
    speaker: speakers.overney,
    lines: ["I'm here until six. After that, God and I have an appointment."],
  },
  overney_graves_menoud: {
    speaker: speakers.overney,
    lines: [
      'Daniel Menoud. Second row. He died two years ago, in December.',
      'A gentle man. Clever hands. He could fix anything except himself.',
      'He carried more than anyone saw. One Sunday it was too much, and he took his own life.',
      'I buried him with a full mass. Some old people objected. I did not listen to them.',
      "Somebody lights the lantern on his grave every Saturday. I don't ask who. Neither should you.",
    ],
    next: 'overney_graves_gremaud',
  },
  overney_graves_gremaud: {
    speaker: speakers.overney,
    lines: [
      'Jean-Pierre Gremaud. Our syndic for twenty-six years. My friend.',
      "He walked out of his house one night in January '97, in the snow, and was never seen again.",
      'We searched for five days. The river, the road, the forest. Nothing.',
      'Odile put up a stone last year so she has somewhere to bring flowers. There is no one under it.',
      "People say things. That he ran off, that he owed money. He didn't. He wasn't that kind of man.",
    ],
    next: 'overney_graves_chassot',
  },
  overney_graves_chassot: {
    speaker: speakers.overney,
    lines: [
      'And Marc Chassot. Back row, by the forest wall, with his mother.',
      "An old Leurs family. He left at twenty, very angry, after his father died. Twenty years we didn't see him.",
      "In '95 word came that he had died abroad. In the war in Yugoslavia.",
      'Jean-Pierre arranged everything. The coffin came home sealed. We buried him three years ago this Saturday.',
    ],
    next: 'overney_graves_whisper',
  },
  overney_graves_whisper: {
    speaker: speakers.overney,
    effects: { set: 'abbe_told_graves' },
    lines: [
      "Now, the whispers. You'll hear them anyway, so hear them from me.",
      "Some say Marc didn't die. That he came back with his face burned, and hides it behind a mask.",
      'That is what people do with grief. They turn it into a story they can stand.',
    ],
    choices: [
      { text: 'Do you think it could be true?', next: 'overney_true' },
      { text: 'Where are the burial records kept?', next: 'overney_register_mention' },
    ],
  },
  overney_true: {
    speaker: speakers.overney,
    lines: [
      'I said the mass. I blessed the coffin. I gave his mother communion at the graveside.',
      "What I think doesn't matter very much.",
    ],
    next: 'overney_register_mention',
  },
  overney_register_mention: {
    speaker: speakers.overney,
    lines: [
      'If you want the dates, the register is in the sacristy. Every burial since 1802.',
      "Come after morning mass tomorrow, at half past eight. I'll let you read it.",
      "Not tonight. Tonight I'm tired.",
    ],
  },
  overney_day1_again: {
    speaker: speakers.overney,
    lines: ['Tomorrow, half past eight. Go and look at the stones if you must. Not too late.'],
  },
  overney_register_offer: {
    speaker: speakers.overney,
    lines: [
      'You came. Good. Most people say tomorrow and mean never.',
      "The registers are in the cupboard. The burials are the green books. Don't lick your fingers.",
      "I'll be in the office.",
    ],
    next: 'overney_register_offer.2',
  },
  'overney_register_offer.2': {
    lines: ['He unlocks the cupboard and leaves the key in it.'],
  },
  overney_seal: {
    speaker: speakers.overney,
    effects: { set: 'abbe_seal_hint' },
    lines: ['You found what you were looking for.'],
    choices: [
      { text: "Marc's coffin was handed over by the syndic. Sealed. No body shown. No death certificate.", next: 'overney_seal_2' },
      { text: 'Why was there never a death certificate?', next: 'overney_seal_2' },
    ],
  },
  overney_seal_2: {
    speaker: speakers.overney,
    lines: [
      "I wrote that entry in November '95. I wrote what I saw. That's all a register is.",
      'Since then I have been told things.',
      'Things told to a priest under the seal of confession can never be repeated. Not in a court. Not to a bishop.',
      'Not to stop a war. Not to bring a man home.',
    ],
    next: 'overney_seal_3',
  },
  overney_seal_3: {
    speaker: speakers.overney,
    lines: [
      "So I can't help you. Do you understand? I cannot.",
      'But the register is not a confession. It says what it says.',
      'And a man may go and stand at a grave and ask himself what is in it. That is between him and God.',
    ],
    choices: [
      { text: 'Who confessed to you?', next: 'overney_seal_who' },
      { text: 'Is he dangerous?', next: 'overney_seal_danger' },
    ],
  },
  overney_seal_who: {
    speaker: speakers.overney,
    lines: [
      "You know I won't answer that.",
      "Go and see Odile Gremaud. I'll telephone her. She has been alone with her questions long enough.",
    ],
    next: 'overney_seal_end',
  },
  overney_seal_danger: {
    speaker: speakers.overney,
    lines: [
      'Who?',
      '...',
      'I have never met anyone who frightened me less than the dead do.',
    ],
    next: 'overney_seal_who',
  },
  overney_seal_end: {
    speaker: speakers.overney,
    lines: ["And please. If you go up there at night, take Raymond's rounds seriously. He's not a patient man."],
  },
  overney_day2_again: {
    speaker: speakers.overney,
    lines: ["I've said all I may say. More than I should have, maybe."],
  },
  overney_day3: {
    speaker: speakers.overney,
    lines: ['Sit with me a moment.'],
    next: 'overney_day3.2',
  },
  'overney_day3.2': {
    lines: ["We sit in the front pew. The tower clock clicks. He doesn't say anything else."],
  },
  overney_day3_letter: {
    speaker: speakers.overney,
    effects: { set: 'abbe_day3' },
    lines: [
      "You have something in your coat you didn't have yesterday. You keep touching it.",
      "No. Don't show me. If I read it, I'll have to decide what I know.",
      'Jean-Pierre came to see me often, that last year. What he told me, I keep.',
      'Bring him bread.',
    ],
    next: 'overney_day3_letter.2',
  },
  'overney_day3_letter.2': {
    lines: ['He gets up before I can ask who. His knees crack. He goes into the sacristy and closes the door.'],
  },
} satisfies Record<string, ScriptNode>;
