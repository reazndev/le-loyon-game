import { speakers } from '../speakers';
import type { ScriptNode } from './script';

export const nodes = {
  phone_idle: {
    if: { notFlag: 'editor_called', count: [['day', '!=', 3]] },
    lines: ["A dial tone. I don't have anyone to call yet."],
  },
  phone_editor: {
    speaker: speakers.editor,
    if: { notFlag: 'editor_called', count: [['day', '==', 3]] },
    effects: { set: 'editor_called' },
    lines: [
      "It's me. How's the fog?",
      "I've got a page held for you on Saturday. What do I put on it?",
    ],
    choices: [
      { text: "There's something here. A real person.", next: 'phone_editor_real' },
      { text: "I don't know yet.", next: 'phone_editor_unsure' },
    ],
  },
  phone_editor_real: {
    speaker: speakers.editor,
    lines: [
      'A name? A photo?',
      "Get both. Call me Friday morning before ten. If I don't hear from you, I run the horoscope bigger.",
    ],
  },
  phone_editor_unsure: {
    speaker: speakers.editor,
    lines: ["Then find out. Friday before ten. I don't run fog twice."],
  },
  phone_not_here: {
    if: { flag: 'knows_brodard', notFlag: 'brodard_called' },
    lines: ['I could call Vauchy from here. Monique can hear every word from the counter.', 'The phone box on the square, then.'],
  },
  phone_night_static: {
    if: { count: [['night', '==', 2]] },
    lines: ['Static. Then the tone again.'],
  },
} satisfies Record<string, ScriptNode>;
