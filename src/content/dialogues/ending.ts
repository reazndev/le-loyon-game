import { speakers } from '../speakers';
import type { ScriptNode } from './script';

export const nodes = {
  dawn_cemetery: {
    lines: ["The lantern's out. The stones are wet. Somewhere down in the village, a tractor starts."],
  },
  ending_call: {
    speaker: speakers.editor,
    if: { flag: 'met_marc' },
    lines: [
      "L'Écho, Aebischer.",
      "It's you. Well? I've got a page with a hole in it.",
    ],
    choices: [
      { text: "I've got him. Le Loyon has a name.", next: 'ending_publish_confirm' },
      { text: "There's nothing here. Run the fog.", next: 'ending_secret_confirm' },
    ],
  },
  ending_publish_confirm: {
    lines: [
      'His name. The Legion. The empty coffin. The syndic under the larch. All of it.',
      "Once I say it, it's out. I can't take it back.",
    ],
    choices: [
      { text: 'Read it to her.', effects: { set: 'ending_publish' }, next: 'ending_publish_route' },
      { text: 'Wait.', next: 'ending_call' },
    ],
  },
  ending_secret_confirm: {
    lines: ['A page of fog and folklore. No name. No photo. A man in a mask that nobody can find.'],
    choices: [
      { text: 'Tell her.', effects: { set: 'ending_secret' }, next: 'ending_secret_go' },
      { text: 'Wait.', next: 'ending_call' },
    ],
  },
  ending_publish_route: {
    lines: [],
    next: [{ if: { flag: 'has_evidence' }, to: 'ending_publish_go' }, { to: 'ending_publish_go_weak' }],
  },
  ending_publish_go: {
    speaker: speakers.editor,
    if: { flag: 'has_evidence' },
    lines: [
      '...',
      "Say that again. The whole thing. Slowly. I'm writing.",
      "That's the front page. Not the supplement. The front.",
    ],
  },
  ending_publish_go_weak: {
    speaker: speakers.editor,
    if: { notFlag: 'has_evidence' },
    lines: [
      "And you've got what? A story from a man in a mask, in the dark. No picture. No paper.",
      'I\'ll run it. Page nine. "Questions in Leurs." The lawyers will cut half.',
    ],
  },
  ending_secret_go: {
    speaker: speakers.editor,
    lines: [
      'Nothing at all?',
      '...',
      "All right. Eight hundred words of fog. You'd better make it beautiful.",
    ],
  },
  leave_epilogue: {
    lines: ["I don't turn around in my seat. I don't want to know if it's still there."],
  },
} satisfies Record<string, ScriptNode>;
