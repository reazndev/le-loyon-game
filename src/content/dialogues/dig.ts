import type { ScriptNode } from './script';

export const nodes = {
  dig_menoud: {
    lines: ['No. Not him.'],
  },
  dig_therese: {
    lines: ["That's his mother."],
  },
  dig_other: {
    lines: ["No. That's someone's family."],
  },
  dig_gremaud: {
    effects: { set: 'dug_gremaud_stone' },
    lines: [
      'Two strokes, and the blade rings on concrete. A footing for the stone. Nothing under it.',
      'There never was anything under it.',
      'That was loud.',
    ],
  },
  dig_gremaud_again: {
    if: { flag: 'dug_gremaud_stone' },
    lines: ["Concrete. He isn't here."],
  },
  dig_chassot_start: {
    if: { count: [['dig_stage', '==', 0]] },
    lines: [
      "Marc's side. Where the boot prints stand.",
      "If I'm wrong about this, there's no explaining it to anyone.",
    ],
    choices: [
      { text: 'Dig.', next: 'dig_chassot_1' },
      { text: 'Not yet.', next: 'dig_not_yet' },
    ],
  },
  dig_not_yet: {
    lines: ['I stand there with the shovel. The forest breathes behind the wall.'],
  },
  dig_chassot_1: {
    effects: { assign: { dig_stage: 1 } },
    lines: ['The gravel first, raked into a pile. Then the turf comes away in wet squares.'],
  },
  dig_chassot_2: {
    effects: { assign: { dig_stage: 2 } },
    lines: ['Clay and stones. It sticks to the blade. My arms are shaking already.'],
  },
  dig_chassot_3: {
    effects: { assign: { dig_stage: 3 } },
    lines: [
      'The earth gets softer. Loose. Dug more than once, not that long ago.',
      "I'm up to my waist. If he comes now I have to climb out.",
    ],
  },
  dig_chassot_4: {
    effects: { assign: { dig_stage: 4 } },
    lines: [
      'Shoulder deep. The walls of the hole drip. The torch beam looks small down here.',
      'Somewhere above me something steps on the gravel and stops.',
    ],
  },
  dig_chassot_5: {
    effects: { assign: { dig_stage: 5 } },
    lines: [
      'The blade hits wood. A hollow sound, very loud.',
      'I scrape the earth off with my hands. Pale pine. A cheap coffin. The lid is screwed down at the corners.',
    ],
  },
  coffin_lid: {
    lines: ['Two screws turn with my fingers. The other two have nearly rusted through.'],
    choices: [
      { text: 'Lift the lid.', next: 'coffin_open' },
      { text: 'Wait.', next: 'coffin_wait' },
    ],
  },
  coffin_wait: {
    lines: ['I listen. No bell. No whistle. Only my own breathing, too loud.'],
    next: 'coffin_lid',
  },
  coffin_open: {
    effects: { set: 'opened_coffin' },
    lines: [
      'The lid comes up with a crack of wood.',
      'The smell is only damp. Wet wood and old cloth.',
      'The coffin is empty.',
      'No one was ever in here.',
      "There's a box.",
    ],
  },
  coffin_box: {
    effects: { set: 'read_gremaud_letter', give: ['bunker_key', 'gremaud_letter', 'legion_tag'] },
    lines: [
      'A cash box. Not locked. Inside, wrapped in an oilcloth:',
      'A key on a brass tag. An envelope. And a dented metal disc on a chain.',
    ],
  },
  coffin_after: {
    lines: ['I should put this back the way it was.'],
  },
  refill_1: {
    effects: { assign: { refill_stage: 1 } },
    lines: [
      'The lid back on. The screws into the same holes. Earth on wood, a dull sound like a door closing far away.',
    ],
  },
  refill_2: {
    effects: { assign: { refill_stage: 2 } },
    lines: ['Half full. My hands are raw.'],
  },
  refill_3: {
    effects: { set: 'grave_refilled', assign: { refill_stage: 3 } },
    lines: ['The turf back in squares. Gravel over it. It looks almost right. In the rain, it will look right.'],
  },
  leave_open_warning: {
    if: { flag: 'opened_coffin', notFlag: 'grave_refilled' },
    lines: ["I'm leaving it open. Raymond will find it in the morning."],
    choices: [
      { text: 'Go anyway.', next: 'leave_open_go' },
      { text: 'Go back and fill it.', next: 'leave_open_back' },
    ],
  },
  leave_open_go: {
    effects: { set: 'grave_left_open' },
    lines: ["I can't do any more tonight."],
  },
  leave_open_back: {
    lines: ['Back to the hole.'],
  },
} satisfies Record<string, ScriptNode>;
