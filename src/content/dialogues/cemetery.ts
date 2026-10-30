import type { ScriptNode } from './script';

export const nodes = {
  path_cross: {
    lines: ['A wayside cross. Someone has tied a rosary to the foot of it. The beads are wet.'],
  },
  path_forest_blocked: {
    if: { notFlag: 'first_sighting' },
    lines: ["The path goes on past the cemetery into the forest. In this fog I'd lose myself in a minute."],
  },
  grave_menoud_lantern: {
    if: { count: [['night', '==', 1]] },
    effects: { set: 'saw_lantern_lit' },
    lines: [
      "The lantern is lit. A new candle, burned down a finger's width. Someone was here less than an hour ago.",
    ],
  },
  grave_menoud_lantern_dark: {
    if: { count: [['night', '==', 2]] },
    lines: ['The lantern is dark. Cold wax.'],
  },
  grave_menoud_lantern_night3: {
    if: { count: [['night', '==', 3]] },
    lines: ['Lit again. Tonight he came here first.'],
  },
  grave_chassot_look: {
    if: { notFlag: 'read_grave_chassot' },
    effects: { set: 'read_grave_chassot' },
    lines: [
      'Two boot prints in the gravel at the foot of the grave, pressed deep. Someone stands here a long time.',
    ],
  },
  grave_chassot_look_again: {
    if: { flag: 'read_grave_chassot' },
    lines: ['"Tombé loin des siens." Fallen far from his own. And buried right beside them.'],
  },
} satisfies Record<string, ScriptNode>;
