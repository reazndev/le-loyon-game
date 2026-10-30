import type { ScriptNode } from './script';

export const nodes = {
  photo_treeline_look: {
    lines: [
      "There's nothing there. I looked. There was nothing there.",
      '...',
      "There's something there.",
    ],
  },
  photo_treeline_look_after: {
    if: { flag: 'read_marc_notebook' },
    lines: ['He was there. Watching me take it.'],
  },
} satisfies Record<string, ScriptNode>;
