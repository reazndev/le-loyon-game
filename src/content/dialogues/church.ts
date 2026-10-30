import type { ScriptNode } from './script';

export const nodes = {
  church_saint_maurice: {
    lines: ['Saint Maurice. A soldier. The plaque says he laid down his sword rather than kill innocent people.'],
  },
  church_candles: {
    lines: ['A rack of votive candles. Three are lit. One franc in the box.'],
    choices: [
      { text: 'Light a candle.', next: 'church_candle_lit' },
      { text: 'Leave it.', next: 'church_candles_end' },
    ],
  },
  church_candle_lit: {
    effects: { set: 'lit_candle' },
    lines: ['The coin drops a long way into the box. The wick takes.'],
  },
  church_candles_end: {
    lines: ['Not now.'],
  },
  church_confessional: {
    lines: ["The confessional. A purple curtain on the penitent's side. The grille is dark."],
    choices: [
      { text: 'Sit inside.', next: 'church_confessional_in' },
      { text: 'Leave it.', next: 'church_candles_end' },
    ],
  },
  church_confessional_in: {
    lines: [
      'It smells of wood polish and old breath. Through the grille, nothing.',
      'I sit for a while. The tower clock clicks.',
    ],
  },
  church_bulletin: {
    lines: [
      'A parish bulletin pinned by the door.',
      '"Samedi 21 novembre: messe anniversaire pour les défunts du mois." {{Saturday 21 November: anniversary mass for the dead of the month.}}',
    ],
  },
  office_computer: {
    lines: [
      'A beige computer, switched off. A sticky note on the monitor: "Bulletin: F2 = imprimer. Ne PAS toucher le modem. Y." {{F2 = print. Do NOT touch the modem.}}',
    ],
  },
  office_desk: {
    lines: [
      "A typed bulletin, half finished. A list of names for Saturday's mass for the dead of the month. Chassot Marc is on it.",
    ],
  },
  office_photo: {
    lines: [
      'A framed photo on the filing cabinet. Two men in their fifties, laughing, holding a huge trout between them.',
      'The abbé and, I think, the syndic.',
    ],
  },
} satisfies Record<string, ScriptNode>;
