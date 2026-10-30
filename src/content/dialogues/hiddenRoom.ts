import { speakers } from '../speakers';
import type { ScriptNode } from './script';

export const nodes = {
  marc_door_voice: {
    effects: { set: 'met_marc' },
    lines: [
      'Silence. Long enough that I think the room is empty.',
      'Then, on the other side of the steel, breathing. Slow. Through rubber.',
    ],
    next: 'marc_door_voice.2',
  },
  'marc_door_voice.2': {
    speaker: speakers.loyon,
    lines: [
      '...',
      'Jean-Pierre knocked like that.',
      'Jean-Pierre is dead.',
    ],
    choices: [
      { text: 'I know. I read his letter.', next: 'marc_door_letter' },
      { text: 'I found the key in your grave.', next: 'marc_door_letter' },
    ],
  },
  marc_door_letter: {
    speaker: speakers.loyon,
    effects: { add: { marc_trust: 1 } },
    lines: [
      '...',
      "Then you dug. You're the stranger from the inn.",
      "Step back from the door. To the bunks. I'll open it.",
    ],
    next: 'marc_door_letter.2',
  },
  'marc_door_letter.2': {
    lines: [
      'I step back. The lock turns from inside. The door opens on darkness, and a candle somewhere behind.',
      "He's standing well back in the room. A shape. The cape. The mask. He doesn't come any closer.",
    ],
    next: 'marc_monologue_1',
  },
  marc_dark_room: {
    effects: { set: ['met_marc', 'entered_hidden_room'] },
    lines: [
      "He's in the corner. Standing. Facing me.",
      'He was there in the dark the whole time I looked around.',
    ],
    next: 'marc_dark_room.2',
  },
  'marc_dark_room.2': {
    speaker: speakers.loyon,
    lines: [
      '...',
      'Put the light down. Not in my face.',
      'Please.',
    ],
    next: 'marc_monologue_1',
  },
  room_enter: {
    effects: { set: 'entered_hidden_room' },
    lines: [
      "A key that hasn't turned in three years turns easily. It's been oiled.",
      'The door swings in. Warm air. Candle smoke. Someone lives here.',
    ],
  },
  marc_doorway: {
    effects: { set: 'met_marc' },
    lines: [
      "He's in the doorway.",
      "I didn't hear him. Not a step.",
    ],
    next: 'marc_doorway.2',
  },
  'marc_doorway.2': {
    speaker: speakers.loyon,
    lines: [
      '...',
      "You found Jean-Pierre's key.",
      "Don't move. I won't either.",
    ],
    next: 'marc_monologue_1',
  },
  room_camp_bed: {
    lines: ['A camp bed. The blanket is folded so tight you could bounce a coin on it.'],
  },
  room_kepi: {
    lines: [
      'A white cap in a plastic bag, hung on a nail like a picture. A képi blanc. The Legion.',
      'Kept clean. Kept out of the damp.',
    ],
  },
  room_mask_hook: {
    if: { notFlag: ['knock_pattern_done', 'met_marc'] },
    lines: [
      'A gas mask on a hook. Tan rubber. The inside of the eyepieces is fogged, as if someone took it off just now.',
      'He has more than one face.',
    ],
  },
  room_shelves: {
    lines: [
      "Tins. Most of them empty, washed, stacked. Army biscuits. A bag of potatoes from the Chassot garden, I'd bet.",
      'A tin of five-franc and two-franc coins.',
    ],
  },
  room_map: {
    lines: [
      'A map of the valley under glass. On the glass, in grease pencil, lines. Paths. Times.',
      '"R. 21:00 - 02:00, toutes les 1h30." {{R. 9 pm to 2 am, every hour and a half.}} Raymond\'s rounds.',
      '"Samedi: D." {{Saturday: D.}} Daniel.',
    ],
  },
  room_photo: {
    effects: { give: 'photo_boys' },
    lines: [
      'A photograph propped against the candle. Two boys on a moped by the village fountain, grinning. Summer.',
      'On the back, in pencil: "Marc et Dani, 1972."',
    ],
  },
  room_notebook: {
    effects: { set: 'read_marc_notebook' },
    lines: [
      'A school exercise book. Pencil. Small square capitals. Each page is a date.',
      'He drew me. At the stones. At the door. With the shovel.',
      'He left my face empty.',
    ],
  },
  room_ring: {
    effects: { set: 'saw_ring' },
    lines: [
      'A small round tin, a throat pastille tin. Inside, on cotton wool, a gold wedding ring.',
      'Engraved inside: "J-P - O 1958."',
      'A slip of paper folded around it: "Pour Odile. Un jour." {{For Odile. One day.}}',
    ],
  },
  room_notes_gremaud: {
    lines: [
      "A bundle of notes on squared paper held with a rubber band. The syndic's handwriting. Lists. Messages.",
    ],
  },
  room_phone: {
    lines: ['An army field phone on the wall, the twin of the one in the guard room.'],
  },
} satisfies Record<string, ScriptNode>;
