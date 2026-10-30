import type { ScriptNode } from './script';

export const nodes = {
  room_bed: {
    if: { count: [['night', '==', 0], ['day', '<', 4]] },
    lines: ['Not tired. Not yet.'],
  },
  room_bed_night: {
    if: { count: [['night', '>=', 1]] },
    lines: ['Sleep.'],
  },
  room_window: {
    lines: [
      'The square. The fountain. The street lamp makes a ball of orange light in the fog and nothing else.',
    ],
  },
  room_window_night2: {
    if: { count: [['night', '==', 2]] },
    lines: ['Someone is standing by the fountain. Hood up. Then the lamp flickers, and the square is empty.'],
  },
} satisfies Record<string, ScriptNode>;
