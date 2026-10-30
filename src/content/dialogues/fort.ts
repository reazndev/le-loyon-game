import type { ScriptNode } from './script';

export const nodes = {
  fort_plate: {
    lines: [
      'A small enamel plate on the steel door. "Ouvrage A 3417. Propriété de la Confédération."',
      'Somebody has scratched out "Confédération" and written "Commune" in marker.',
    ],
  },
  fort_graffiti: {
    lines: [
      'Graffiti on the concrete under the false planks. "KEVIN + SANDRA." "Nirvana." A smiley in a gas mask.',
      'Under it, small, in pencil: "il nous regarde." {{He\'s watching us.}}',
    ],
  },
  fort_door_night1: {
    if: { count: [['night', '==', 1]] },
    effects: { set: ['found_bunker', 'bunker_door_wedged'] },
    lines: [
      'The wheel turns a quarter, then stops hard. Something holds the door from the other side.',
      'I put my ear to the steel.',
      '...',
      "I'm not going to stand here.",
    ],
  },
  fort_door_day2: {
    if: { notFlag: 'bunker_door_open', count: [['day', '>=', 2]] },
    effects: { set: ['bunker_door_open', 'found_bunker'] },
    lines: [
      "The steel door stands open a hand's width. Last night it wouldn't move.",
      'On the floor inside, a wooden wedge, kicked aside.',
    ],
  },
  fort_gaslock_sign: {
    lines: [
      '"GASSCHLEUSE / SAS À GAZ."',
      '"Les deux portes ne doivent jamais être ouvertes en même temps." {{Gas lock. Both doors must never be open at the same time.}}',
      'Both are open.',
    ],
  },
  fort_phone: {
    lines: ['A field telephone. A crank on the side. The wire goes into the wall and nowhere.'],
    choices: [
      { text: 'Turn the crank.', next: 'fort_phone_crank' },
      { text: 'Leave it.', next: 'fort_leave_it' },
    ],
  },
  fort_phone_crank: {
    lines: ['It whirs. Nothing rings. Of course nothing rings.'],
  },
  fort_leave_it: {
    lines: ['No.'],
  },
  fort_chart: {
    lines: [
      'A chart of the valley. Fields of fire drawn in grease pencil, red fans across the slope.',
      'Leurs is a cluster of squares. The cemetery is marked with a cross.',
    ],
  },
  fort_logbook: {
    lines: [
      'A guard logbook on the desk, swollen with damp.',
      'The last army entry: "1993. Contrôle annuel. RAS." {{Annual inspection. Nothing to report.}}',
      'Below it, in pencil, different hands. "Kevin était là 96." "Ici c\'est le Loyon qui dort lol." {{Kevin was here. The Loyon sleeps here lol.}}',
      'And, much later, in small careful capitals: "NE TOUCHEZ PAS AU FOND." {{Don\'t touch the back.}}',
    ],
  },
  fort_mirror: {
    lines: ['Polished steel instead of glass. It gives back a gray smear that is supposed to be me.'],
  },
  fort_tentsheet: {
    if: { count: [['night', '==', 0]] },
    lines: [
      "An old army tent sheet on a hook. The camouflage of my grandfather's time. Damp, heavy, smelling of rubber.",
    ],
  },
  fort_embrasure: {
    lines: [
      'A slit in the concrete. Nothing out there but gray.',
      'From here you would see the whole cemetery. Every grave. Every light.',
    ],
  },
  fort_embrasure_night3: {
    if: { count: [['night', '==', 3]] },
    lines: ["Far below, through the fog, one small red light. Daniel's lantern."],
  },
  fort_masks: {
    lines: [
      'Gas masks. Hundreds. Piled to my waist. Eyepieces everywhere, looking at the ceiling, at the wall, at me.',
      'Old rubber, the color of skin. Brown, tan, gray.',
      "His mask came from here. I'm almost sure of it.",
    ],
  },
  fort_masks_look: {
    if: { count: [['day', '>=', 2]] },
    lines: [
      'One shelf at the end is not collapsed. On it, masks laid out in a row, cleaned, the straps loosened. Five. Six.',
      'And a space where a seventh was.',
    ],
  },
  fort_generator: {
    lines: ['Dead for years. The fuel drums are empty. I tap one and it booms like a church bell.'],
  },
  fort_battery: {
    if: { notFlag: 'found_hidden_door' },
    lines: [
      'A car battery. Newer than anything else here. Two wires go from it along the wall and through a hole in the concrete.',
    ],
  },
  fort_battery_after: {
    if: { flag: 'found_hidden_door' },
    lines: [
      'The wires go through the wall into the room behind the steel door. A light. He has a light in there.',
    ],
  },
  fort_bunks: {
    lines: ['Twenty-four bunks. Twenty-four men slept here, waiting for a war that never came up this valley.'],
  },
  fort_cupboard: {
    if: { notFlag: 'looked_at_dust' },
    lines: [
      'A medical supplies cupboard. Empty except for a roll of yellowed bandages.',
      'Fresh scratches in the wall beside it, pale in the gray concrete. Something heavy rubbed along here. I look down.',
    ],
  },
  fort_dust: {
    if: { notFlag: 'looked_at_dust' },
    effects: { set: 'looked_at_dust' },
    lines: [
      'The floor is thick with dust everywhere. Except here.',
      'In front of the cupboard, the dust is swept away in a quarter circle. As if a door opened. As if the cupboard swung.',
    ],
  },
  fort_cupboard_push: {
    if: { flag: 'looked_at_dust', notFlag: 'found_hidden_door' },
    effects: { set: 'found_hidden_door' },
    lines: [
      "I put my shoulder to it. It's on castors. It rolls aside with a long screech that goes all through the fort.",
      'Behind it, a steel door. Gray. A keyhole. A small stamped plate.',
      '"K.P. 3."',
    ],
  },
  fort_hidden_door_locked: {
    if: { flag: 'found_hidden_door', notFlag: 'has_bunker_key' },
    lines: ["Locked. Cold to the touch. There's a draft under it. It smells of candle smoke."],
  },
  fort_hidden_door_listen: {
    if: { flag: 'found_hidden_door', notFlag: 'has_bunker_key' },
    lines: [
      'I listen at the door. Nothing.',
      'Then something. Very slow. Breathing? Or the wind in a shaft.',
    ],
  },
  fort_wrapper: {
    effects: { set: 'found_biscuit_wrapper' },
    lines: [
      "A biscuit wrapper on the floor by the door. Army biscuits, the hard kind. The plastic is clean. This week's.",
    ],
  },
} satisfies Record<string, ScriptNode>;
