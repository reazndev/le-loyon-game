import type { ScriptNode } from './script';

// The level sets the count logbook_day to the current day on fort_logbook_written, and opens
// fort_logbook_reply instead of fort_logbook once night 3 comes or the day is past logbook_day.

export const nodes = {
  // A10: a line in the logbook.
  fort_logbook_write: {
    if: { notFlag: 'wrote_in_logbook', count: [['night', '==', 0]] },
    lines: ['A pencil stub is tied to the logbook with string. Under "NE TOUCHEZ PAS AU FOND" there\'s half a page left.'],
    choices: [
      {
        text: 'Write: "Je ne vous veux pas de mal." {{I mean you no harm.}}',
        effects: { set: ['wrote_in_logbook', 'logbook_wrote_harm'] },
        next: 'fort_logbook_written',
      },
      {
        text: 'Write: "Qui êtes-vous ?" {{Who are you?}}',
        effects: { set: ['wrote_in_logbook', 'logbook_wrote_who'] },
        next: 'fort_logbook_written',
      },
      { text: 'Write nothing.', next: 'fort_logbook_nothing' },
    ],
  },
  fort_logbook_written: {
    lines: ['My handwriting looks wrong next to the others. Too new.'],
  },
  fort_logbook_nothing: {
    lines: ["No. It isn't my book."],
  },
  fort_logbook_reply: {
    if: { flag: 'wrote_in_logbook' },
    effects: { set: 'read_logbook_reply' },
    lines: [],
    next: [
      { if: { flag: 'logbook_wrote_harm' }, to: 'fort_logbook_reply_harm' },
      { if: { flag: 'logbook_wrote_who' }, to: 'fort_logbook_reply_who' },
    ],
  },
  fort_logbook_reply_harm: {
    lines: [
      'Under my line, in small careful capitals: "ALORS FRAPPEZ." {{Then knock.}}',
      'The pencil lies across the page. I left it on the desk.',
    ],
  },
  fort_logbook_reply_who: {
    lines: [
      'Under my line, in small careful capitals: "PERSONNE. C\'EST ÉCRIT SUR LA PIERRE." {{Nobody. It says so on the stone.}}',
      'The pencil lies across the page. I left it on the desk.',
    ],
  },

  // A11: the chart and the boulder.
  fort_chart_larch: {
    if: { flag: 'read_gremaud_letter' },
    effects: { set: 'read_chart_larch' },
    lines: [
      'The chart of the valley. Now I know what to look for.',
      'Up the slope behind the fort, someone drew a small tree in grease pencil.',
      '"Rp 3 - mélèze." Reference point three. The larch.',
      'The track to it runs to the right of a dot marked "bloc".',
    ],
  },
  forest_boulder: {
    lines: ['A boulder the size of a car, dropped here by a glacier. The track splits around it. Both ways go up into the fog.'],
  },
  forest_highseat: {
    lines: [
      "A hunter's high seat, the ladder rotten through. A plastic bag on the seat, gone white.",
      'Nobody has sat up there in years.',
      "This isn't it.",
    ],
  },
} satisfies Record<string, ScriptNode>;
