import type { ScriptNode } from './script';

export const nodes = {
  door_chassot_farm: {
    lines: [
      'The Chassot farm. Shutters nailed shut. A "À vendre" sign from 1996 lying in the nettles. {{For sale.}}',
    ],
  },
  chassot_garden: {
    if: { count: [['day', '>=', 2]] },
    lines: [
      'Behind the house, a vegetable patch. Leeks, cabbages, the earth turned recently. Somebody keeps this.',
    ],
  },
  door_house_1: {
    lines: ["A television, loud. A man coughing. I don't knock."],
  },
  door_house_2: {
    lines: ["A child's bicycle against the wall. A light upstairs goes off as I come close."],
  },
  door_house_2_night: {
    if: { count: [['night', '>=', 1]] },
    lines: ['A dog barks inside, once, then stops, as if somebody held its mouth.'],
  },
} satisfies Record<string, ScriptNode>;
