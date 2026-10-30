import { speakers } from '../speakers';
import type { EntryTable, ScriptNode } from './script';

export const entry: EntryTable = [
  { if: { notFlag: 'inn_checked_in' }, to: 'monique_checkin' },
  { if: { flag: 'abbe_told_graves', notFlag: 'dinner_day1', count: [['day', '==', 1], ['night', '==', 0]] }, to: 'monique_dinner1' },
  { if: { count: [['day', '==', 1], ['night', '==', 0]] }, to: 'monique_day1' },
  { if: { count: [['night', '>=', 1]] }, to: 'monique_night' },
  { if: { flag: ['has_shovel', 'suspects_empty_coffin'], notFlag: 'dinner_day2', count: [['day', '==', 2], ['night', '==', 0]] }, to: 'monique_dinner2' },
  { if: { count: [['day', '==', 2], ['night', '==', 0]] }, to: 'monique_day2' },
  { if: { flag: 'grave_left_open', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'monique_day3_cold' },
  { if: { flag: 'met_veilleur', count: [['day', '==', 3], ['night', '==', 0]] }, to: 'monique_day3_after' },
  { if: { count: [['day', '==', 3], ['night', '==', 0]] }, to: 'monique_day3' },
  { if: { count: [['day', '==', 4], ['night', '==', 0]] }, to: 'monique_end' },
];

export const nodes = {
  monique_checkin: {
    speaker: speakers.monique,
    lines: [
      "Bonsoir. {{Good evening.}} You're the one who phoned? From the newspaper.",
      "Number three. Upstairs, at the end. The heating knocks, it's normal.",
      'Breakfast seven to nine. Supper at seven if you want it. Tell me before six.',
    ],
    choices: [
      { text: 'Thank you.', next: 'monique_checkin_end' },
      { text: 'What brings people to Leurs?', next: 'monique_checkin_why' },
    ],
  },
  monique_checkin_why: {
    speaker: speakers.monique,
    lines: [
      'Nobody comes to Leurs. A cousin for a funeral. A cattle dealer.',
      'And you. What does a newspaper want here?',
    ],
    choices: [
      { text: "I'm writing about Le Loyon.", next: 'monique_checkin_loyon' },
      { text: 'A piece about village life.', next: 'monique_checkin_life' },
    ],
  },
  monique_checkin_loyon: {
    speaker: speakers.monique,
    lines: [
      'Mon Dieu. That again.',
      "It's a story for children. Some men from the café, a few kirsch, a man in a coat.",
      "Don't get my son started. He has his apprenticeship. He needs his sleep.",
    ],
    next: 'monique_checkin_end',
  },
  monique_checkin_life: {
    speaker: speakers.monique,
    lines: ["Village life. Cows, fog, funerals. Write that and you'll have the truth."],
    next: 'monique_checkin_end',
  },
  monique_checkin_end: {
    speaker: speakers.monique,
    effects: { set: 'inn_checked_in', give: 'inn_room_key' },
    lines: ["Voilà. The key. Don't lose it, I only have the one."],
  },
  monique_day1: {
    speaker: speakers.monique,
    lines: ["Supper's at seven. If you're going to see the abbé, he's in the church until six."],
    choices: [
      { text: 'Who should I talk to here?', next: 'monique_who' },
      { text: 'Can I use the computer in the back?', next: 'monique_computer' },
      { text: 'Nothing, thanks.', next: 'monique_bye' },
    ],
  },
  monique_who: {
    speaker: speakers.monique,
    lines: [
      'Gilles at the garage talks to everyone. Bernard Yerly at the farm talks to nobody.',
      "Christine has the laiterie. Leave Madame Gremaud alone, she's had enough.",
      'And the abbé knows everyone, living or dead.',
    ],
  },
  monique_computer: {
    speaker: speakers.monique,
    lines: [
      "Yannick's machine. He set it up for the bookings. Nobody books.",
      'Go ahead. But it uses the phone line, so if someone calls, they get nothing.',
      "Don't stay on all night. It costs.",
    ],
  },
  monique_bye: {
    speaker: speakers.monique,
    lines: ["À tout à l'heure. {{See you later.}}"],
  },
  monique_dinner1: {
    speaker: speakers.monique,
    effects: { set: 'dinner_day1' },
    lines: ["Sit. Soupe de chalet. {{Alpine soup.}} There's bread."],
    next: 'monique_dinner1.2',
  },
  'monique_dinner1.2': {
    lines: ["Potatoes, pasta, cream, cheese. It's very good. Monique watches the window while I eat."],
    next: 'monique_dinner1.3',
  },
  'monique_dinner1.3': {
    speaker: speakers.monique,
    lines: ["You saw the abbé? Then you've heard about the cemetery."],
    choices: [
      { text: 'Is it safe to walk up there at night?', next: 'monique_dinner1_torch' },
      { text: 'Who lights the lantern on the Menoud grave?', next: 'monique_dinner1_lantern' },
      { text: 'Good night.', next: 'monique_dinner1_torch' },
    ],
  },
  monique_dinner1_lantern: {
    speaker: speakers.monique,
    lines: [
      "Nobody knows. Christine says it isn't her. Raymond sits up there half the night and never sees anyone.",
      "Somebody who liked Daniel. That's all.",
    ],
    next: 'monique_dinner1_torch',
  },
  monique_dinner1_torch: {
    speaker: speakers.monique,
    effects: { give: 'flashlight' },
    lines: [
      "You're going out. I can see it.",
      "Take this. Raymond walks his dog up there till two. Don't scare him, he's not young.",
      "And bring the torch back. It was my husband's.",
    ],
    next: 'monique_dinner1_torch.2',
  },
  'monique_dinner1_torch.2': {
    lines: ['A heavy metal torch. It smells of the drawer it lived in.'],
  },
  monique_night: {
    lines: [
      'The café is dark. Chairs on the tables. A strip of light under the kitchen door, and the radio, very low.',
    ],
  },
  monique_day2: {
    speaker: speakers.monique,
    if: { notFlag: 'grave_left_open' },
    lines: ['You were out late. I heard the door.'],
    choices: [
      { text: 'I went up to the cemetery.', next: 'monique_day2_cemetery' },
      { text: 'Do you know anything about the old bunker in the forest?', next: 'monique_day2_bunker' },
      { text: 'Did you know Marc Chassot?', if: { flag: 'abbe_told_graves' }, next: 'monique_day2_marc' },
      { text: 'Nothing.', next: 'monique_bye' },
    ],
  },
  monique_day2_cemetery: {
    speaker: speakers.monique,
    lines: [
      'At night. Of course you did.',
      "Yannick came in at one in the morning too. I suppose that's a coincidence.",
    ],
  },
  monique_day2_bunker: {
    speaker: speakers.monique,
    lines: [
      'The "barn" up in Bois-Noir? Army. The commune bought it, God knows why.',
      "The kids go up to drink. I told Yannick if I catch him there I'll sell his moped.",
    ],
  },
  monique_day2_marc: {
    speaker: speakers.monique,
    lines: [
      "I came here when I married, in '78. He'd just left.",
      'I knew his mother. Thérèse. She kept his room the same for twenty years.',
      'When they told her he was dead she said "Good. Now I know where he is." Then she cried for a year.',
    ],
  },
  monique_dinner2: {
    speaker: speakers.monique,
    effects: { set: 'dinner_day2' },
    lines: [
      'Rösti tonight. With an egg.',
      "You have mud on your sleeves. And on the stairs. Bernard's shovel is behind my coat rack, you think I'm blind?",
    ],
    choices: [
      { text: "I'm returning it tomorrow.", next: 'monique_dinner2_b' },
      { text: "Don't tell anyone.", next: 'monique_dinner2_b' },
    ],
  },
  monique_dinner2_b: {
    speaker: speakers.monique,
    lines: [
      "I don't tell anyone anything. That's how you run an inn for twenty years.",
      "Raymond's round is every hour and a half. He takes the long way back past the chapel. I'm just saying.",
    ],
  },
  monique_day3: {
    speaker: speakers.monique,
    lines: ["The fog's worse. You look terrible."],
    choices: [
      { text: 'Could you pack me some bread and cheese?', if: { notFlag: 'has_food' }, next: 'monique_food' },
      { text: 'The editor might call.', if: { notFlag: 'editor_called' }, next: 'monique_editor_note' },
      { text: 'Nothing.', next: 'monique_bye' },
    ],
  },
  monique_food: {
    speaker: speakers.monique,
    effects: { give: 'food_parcel' },
    lines: [
      'For a picnic? In this?',
      "Here. Bread, a piece of Gruyère, two apples. You don't have to tell me.",
    ],
  },
  monique_editor_note: {
    speaker: speakers.monique,
    lines: ["A woman called this morning. She'll call back at noon. She didn't sound patient."],
  },
  monique_day3_cold: {
    speaker: speakers.monique,
    lines: [
      'Raymond found the Chassot grave open this morning. Dug out. The coffin lid off.',
      "He's called Romont. The gendarmes come tomorrow.",
      "I have your shovel mud on my stairs. I'm not going to say anything. But you'll take the first bus tomorrow.",
      'I mean it.',
    ],
    choices: [
      { text: 'I understand.', next: 'monique_day3_cold_b' },
      { text: "It's not what you think.", next: 'monique_day3_cold_b' },
    ],
  },
  monique_day3_cold_b: {
    speaker: speakers.monique,
    lines: [
      "I don't think anything. I run an inn.",
      "If you want bread, Christine still sells it. I won't pack you anything.",
    ],
  },
  monique_day3_after: {
    speaker: speakers.monique,
    lines: [
      "He told me. About the forum, and following you. He's sixteen. He's stupid.",
      "He said you weren't angry. Thank you.",
    ],
    choices: [
      { text: 'Could you pack me some bread and cheese?', if: { notFlag: ['has_food', 'grave_left_open'] }, next: 'monique_food' },
      { text: 'Good night.', next: 'monique_bye' },
    ],
  },
  monique_end: {
    speaker: speakers.monique,
    lines: [
      "You're up early. Or you never went to bed.",
      "There's coffee. The phone's in the back if you need to call your newspaper.",
    ],
  },
} satisfies Record<string, ScriptNode>;
