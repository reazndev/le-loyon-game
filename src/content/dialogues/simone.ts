import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'simone_day1' },
  { if: { notFlag: 'simone_printed', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'simone_printer' },
  { if: { flag: 'chu_harmonium_reed', notFlag: 'knows_brodard' }, to: 'simone_reed' },
  { if: { notFlag: 'knows_brodard', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'simone_plate' },
  { if: { notFlag: 'chu_harmonium_reed', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'simone_practising' },
  { to: 'simone_saturday' },
];

export const nodes = {
  simone_day1: {
    speaker: speakers.simone,
    effects: { set: 'simone_met' },
    lines: ["Bonsoir. If it's the abbé you want, he's by the candles.", "If it's anything else, it's me."],
    choices: [
      { text: 'What do you do here?', next: 'simone_job' },
      { text: 'Nothing, thanks.', next: 'simone_bye' },
    ],
  },
  simone_job: {
    speaker: speakers.simone,
    lines: [
      'Sacristan. Flowers, linen, the bell rope, the harmonium.',
      'And the bulletin, since the abbé bought that computer. God help me.',
      'Simone Grandjean. Like the healer on the old stone by the wall. No relation, I tell people. Nobody believes me.',
    ],
    choices: [
      { text: 'You play at funerals?', next: 'simone_funerals' },
      { text: 'Thanks.', next: 'simone_bye' },
    ],
  },
  simone_funerals: {
    speaker: speakers.simone,
    lines: [
      "Every one for thirty years. Weddings too, but there aren't many weddings now.",
      'You can tell a village by its funerals. Here they all come, and nobody says anything afterward.',
    ],
  },
  simone_bye: {
    speaker: speakers.simone,
    lines: ['À demain, peut-être. {{Until tomorrow, maybe.}}'],
  },
  simone_saturday: {
    speaker: speakers.simone,
    lines: [
      "Saturday at six, if you're still here. The mass for the dead of the month. I read the names.",
      "I asked the abbé if I should keep reading Marc Chassot's. Three years now.",
      'He said, keep reading him. He said it strangely.',
    ],
  },
  simone_practising: {
    speaker: speakers.simone,
    lines: ["Saturday's hymn. I play it badly all week so I can play it well on Saturday."],
  },
  simone_plate: {
    speaker: speakers.simone,
    effects: { set: 'knows_brodard' },
    lines: [
      "Saturday I read Marc Chassot's name again. I played at that funeral.",
      'I always read the little plate on a coffin, you know. Habit. Who made it.',
      'Brodard, from Vauchy. He makes half the coffins in the district.',
      'Funny thing to find on a coffin that came from France.',
    ],
  },

  // A2: the burials books are in the parish office.
  sacristy_register_gap: {
    if: { notFlag: 'simone_printed' },
    effects: { set: 'saw_register_gap' },
    lines: [
      'Red books, a black one. Where the green ones should be, a gap, and a slip of paper.',
      '"Sépultures 87- → bureau (bulletin). S.G." {{Burials 87 on → office (bulletin). S.G.}}',
    ],
  },
  simone_printer: {
    lines: ['A woman in a long cardigan sits at the office computer, glaring at it. Beside it, a printer, silent.'],
    next: 'simone_printer.2',
  },
  'simone_printer.2': {
    speaker: speakers.simone,
    lines: [
      "Don't come in, I'll make it worse. Oh. It's you.",
      "You'll want the burials books. They're here. I'm copying the names for Saturday and now this thing won't print.",
      "Yannick from the inn set it up. He wrote me a note, and I've lost my glasses.",
    ],
    choices: [
      { text: 'Can I try?', next: 'simone_printer_try' },
      { text: "I'll come back.", next: 'simone_printer_later' },
    ],
  },
  simone_printer_try: {
    speaker: speakers.simone,
    effects: { set: 'simone_asked_help' },
    lines: ["Please. Only don't touch the modem. If you touch the modem it telephones Lausanne."],
  },
  simone_printer_later: {
    speaker: speakers.simone,
    lines: ["The books aren't going anywhere. Neither am I."],
  },
  office_computer_print: {
    if: { flag: 'simone_asked_help', notFlag: 'simone_printed' },
    lines: ['The bulletin is on the screen, all typed. The sticky note on the monitor: "Bulletin: F2 = imprimer."'],
    choices: [
      { text: 'Press F2.', next: 'office_print' },
      { text: 'Press Enter.', next: 'office_print_wrong' },
      { text: 'Leave it.', next: 'office_print_leave' },
    ],
  },
  office_print_wrong: {
    lines: ['It beeps and asks if I want to save the changes. I press nothing else.'],
  },
  office_print_leave: {
    lines: ['Not yet.'],
  },
  office_print: {
    effects: { set: 'simone_printed', give: ['burials_book', 'bulletin_november'] },
    lines: ['The printer wakes up and screams, one line at a time. The whole office shakes with it.'],
    next: 'office_print.2',
  },
  'office_print.2': {
    speaker: speakers.simone,
    lines: [
      'Ah! Voilà. Merci, merci. You people with computers just know.',
      'Take the books back to the cupboard for me, would you? The abbé likes things where they live.',
      "And take a bulletin. Saturday. Come if you're still here.",
    ],
  },
  sacristy_books_back: {
    if: { flag: 'has_burials_book' },
    lines: ["I put the green books back in the gap. They're warm from the office."],
  },

  // A3: the harmonium reed.
  simone_reed: {
    speaker: speakers.simone,
    effects: { set: 'knows_brodard' },
    lines: [
      "It does that. The low A sticks when it's damp.",
      "It stuck at Marc Chassot's funeral. All through the absolution, one note, and nobody could stop it.",
      'Raymond said it was Marc complaining about the music. Raymond is like that.',
      'I always read the little plate on a coffin, you know. Habit. Who made it.',
      'Brodard, from Vauchy. He makes half the coffins in the district.',
      'Funny thing to find on a coffin that came from France.',
    ],
    next: 'simone_reed.2',
  },
  'simone_reed.2': {
    lines: ['She plays the first chord again, carefully. This time the A behaves.'],
  },
} satisfies Record<string, ScriptNode>;
