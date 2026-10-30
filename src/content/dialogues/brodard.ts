import { speakers } from '../speakers';
import type { ScriptNode } from './script';

// "Look up Brodard" ends the dialogue so the level can open doc_directory_vauchy, then play
// phonebox_no_card or phonebox_brodard again.

export const nodes = {
  phonebox_brodard: {
    if: { flag: 'knows_brodard', notFlag: 'brodard_called' },
    lines: ['A red phone box. Taxcard only. The directory is swollen with damp.'],
    choices: [
      { text: 'Look up Brodard, Vauchy.', effects: { set: 'read_directory_vauchy' }, next: 'phonebox_lookup' },
      { text: 'Call Brodard.', if: { flag: ['read_directory_vauchy', 'has_taxcard'] }, next: 'brodard_call' },
      { text: 'Leave it.', next: 'phonebox_leave' },
    ],
  },
  phonebox_lookup: {
    lines: ['I peel the wet pages apart. V. Vauchy.'],
  },
  phonebox_no_card: {
    if: { notFlag: 'has_taxcard' },
    lines: ["I've got the number. The box only takes a taxcard. The dairy shop will sell me one."],
  },
  phonebox_leave: {
    lines: ['Not now.'],
  },
  brodard_call: {
    lines: ['I push the card in. The display counts it: 10.00. The ringing goes on a long time.', 'A click. A radio somewhere behind the voice.'],
    next: 'brodard_call.2',
  },
  'brodard_call.2': {
    speaker: speakers.brodard,
    lines: ['Brodard, menuiserie.'],
    choices: [
      { text: "I'm a journalist. I'm asking about a coffin you made in November '95. For Leurs.", next: 'brodard_coffin' },
      { text: 'Sorry. Wrong number.', next: 'brodard_hangup' },
    ],
  },
  brodard_hangup: {
    lines: ['I hang up. The card comes out. 9.40.'],
  },
  brodard_coffin: {
    speaker: speakers.brodard,
    lines: ["Leurs. The syndic's boy. The one from France.", "Oui, I remember. You don't forget the ones you make for nobody."],
    choices: [{ text: 'For nobody?', next: 'brodard_nobody' }],
  },
  brodard_nobody: {
    speaker: speakers.brodard,
    effects: { set: 'brodard_called' },
    lines: [
      'The syndic came himself, in his own car. A Thursday. Plain pine, lined, gray satin.',
      'No name plate, he said. I put my own little plate on the foot. I always do.',
      'He said the French were sending the remains sealed, and he would make the transfer himself. Family. Out of respect.',
      "I said, Monsieur le syndic, that's not how it's done. He said, Aloys, please.",
      "So I didn't ask. I put the lid on loose and gave him the screws in a paper bag.",
      'And my good screwdriver. Never saw it again.',
      'We carried it to his car together. Empty, of course. It was new.',
    ],
    next: 'brodard_breath',
  },

  // A6: someone on the line. The level raises the reporter's breathing for this node.
  brodard_breath: {
    speaker: speakers.brodard,
    lines: ['...', 'Is there somebody there with you?', 'I can hear somebody breathing. Slow.'],
    choices: [
      { text: "No. I'm alone.", next: 'brodard_alone' },
      { text: "Who's there?", next: 'brodard_alone' },
    ],
  },
  brodard_alone: {
    speaker: speakers.brodard,
    lines: ["Then it's the line. Vauchy has had bad lines since the mobilisation.", 'Write what you like. Leave my name out of it.'],
    next: 'brodard_alone.2',
  },
  'brodard_alone.2': {
    lines: ['He hangs up. The display says 2.40. I stand in the box a moment longer than I need to.'],
  },
} satisfies Record<string, ScriptNode>;
