import type { ScriptNode } from './script';

export const nodes = {
  square_fountain: {
    lines: ['A stone basin, 1873 carved on the rim. The water runs whether anyone drinks or not.'],
  },
  square_memorial: {
    lines: [
      'A bronze plaque. "Aux soldats de Leurs, mobilisation 1914-1918." Four names. None of them died in a war.',
    ],
  },
  square_phonebox: {
    lines: ['A red phone box. Taxcard only. The directory is swollen with damp.'],
  },
  square_phonebox_night: {
    if: { count: [['night', '>=', 1]] },
    lines: ['The light in the box flickers. The receiver hangs a little off its hook. I put it back.'],
  },
  square_busstop: {
    if: { notFlag: 'met_marc' },
    lines: ['PostBus. Leurs, Place. 6:41, 9:15, 13:30, 18:52. Nothing on Sundays after noon.'],
    choices: [
      { text: 'Wait for the bus and go home.', next: 'leave_confirm' },
      { text: 'Not yet.', next: 'square_busstop_end' },
    ],
  },
  leave_confirm: {
    lines: ["If I get on, I don't come back. Go home?"],
    choices: [
      { text: 'Go home.', effects: { set: 'ending_leave' }, next: 'leave_go' },
      { text: 'Stay.', next: 'square_busstop_end' },
    ],
  },
  leave_go: {
    lines: ['I wait in the fog for the headlights.'],
  },
  square_busstop_end: {
    lines: ['Not yet.'],
  },
} satisfies Record<string, ScriptNode>;
