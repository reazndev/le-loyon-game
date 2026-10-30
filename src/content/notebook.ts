import type { Condition, CountTest } from '../game/conditions';
import type { Flag } from './flags';

// The diary note is keyed on odile_talked, the flag set when Odile hands the diary over, since reading a
// document sets no flag of its own. Lines from the prologue's notes.txt belong to the desktop agent.

export interface NotebookEntry {
  text: string;
  /** Checked when the key flag turns on; the entry is skipped if it fails then. */
  if?: Condition;
}

/**
 * Lines the game adds to the reporter's notebook, keyed by the flag that adds them, in story order.
 * Keys may be derived flags; watch them with `holds`.
 */
export const notebook = {
  arrived: { text: 'Leurs. Inn, room 3. Last bus 18:52. Ask about the man in the mask.' },
  abbe_told_graves: {
    text: 'Three graves. Daniel Menoud, suicide, Dec 96. J.-P. Gremaud, syndic, vanished Jan 97, a stone and no body. Marc Chassot, died abroad in 95, the war in Yugoslavia. Back row, with his mother.',
  },
  met_gilles: { text: "Gilles saw him 'staring at a grave'. Back row." },
  bunker_door_wedged: {
    if: { flag: 'first_sighting' },
    text: 'Someone at the back wall. Into the forest. A barn in the woods. The door held from inside.',
  },
  forum_seen_2: { text: 'Someone on the board knows what I did last night. Down to the soup.' },
  read_register: {
    text: `Marc Chassot's coffin: sealed, handed over by the syndic.
No body shown. Death certificate "to follow". It never
followed. Bearers: Yerly, Dousse, Bapst, Menoud.`,
  },
  read_chronicle: {
    if: { flag: 'read_register' },
    text: "The abbé prays for 'J.-P. and M.' Every morning. Present tense.",
  },
  bernard_light_coffin: { text: "Bearers: Yerly, Dousse, Bapst, Menoud. 'Like lifting a door.'" },
  knows_legion: { text: "Calvi 1979. 'Here I go by another name.' The Legion." },
  odile_talked: {
    text: "BN, twice a week, all year. Bois-Noir? 'D.M. knows.' Daniel Menoud. 'Confession' in November. 'Happy new year, my boy.'",
  },
  suspects_empty_coffin: { text: "Marc Chassot's coffin. Sealed, from the syndic. Nobody saw inside. What was in it?" },
  found_hidden_door: { text: 'A steel door behind a cupboard. K.P. 3. Locked. Candle smoke.' },
  read_gremaud_letter: {
    text: `Gremaud. He knew. The coffin was empty from the start.
"K.P. 3." The room at the end of the fort.
Knock three times, wait, then once.
Bread. The larch above the fort.
CHALLAND M. Who is Challand?`,
  },
  found_forest_grave: {
    text: 'Gremaud is under the larch. Someone buried him and marked it. Someone close enough to come up here every day.',
  },
  editor_called: { text: 'Ruth. Friday before ten. A name and a photo.' },
  met_veilleur: { text: "veilleur = Yannick, the boy from the garage. He's seen him six or seven times." },
} satisfies Partial<Record<Flag, NotebookEntry>>;

export interface NotebookGoal {
  text: string;
  if: Condition;
  /** The scene the step happens in, for the compass. */
  to?: string;
  /** A character there to point at, by cast id. */
  who?: string;
}

const day = (n: number): CountTest[] => [['day', n === 1 ? '<=' : '==', n], ['night', '==', 0]];
const night = (n: number): CountTest[] => [['night', '==', n]];

/**
 * What the reporter means to do next, shown at the top of the notebook. The first goal whose
 * condition holds is the one shown, so each day lists its unfinished steps in the order to take them.
 */
export const notebookGoals: NotebookGoal[] = [
  { if: { count: day(1), notFlag: 'inn_checked_in' }, text: 'Go to the inn on the square and talk to the innkeeper.', to: 'inn', who: 'monique' },
  { if: { count: day(1), notFlag: 'abbe_told_graves' }, text: 'Go to the church and talk to the priest.', to: 'church', who: 'overney' },
  { if: { count: day(1), notFlag: 'dinner_day1' }, text: 'Talk to people around the village: the dairy shop, the garage, the farm. Then ask the innkeeper for supper.' },
  { if: { count: night(1), not: { flag: ['read_grave_menoud', 'read_grave_gremaud', 'read_grave_chassot'] } }, text: 'Go up to the cemetery and read the three graves the priest told you about.', to: 'cemetery' },
  { if: { count: night(1), notFlag: ['met_raymond', 'first_sighting', 'skipped_follow', 'found_bunker'] }, text: 'Wait by the graves. Listen.' },
  { if: { count: night(1), notFlag: ['first_sighting', 'skipped_follow', 'found_bunker'] }, text: 'Stay a while. Watch the trees past the back wall.' },
  { if: { count: night(1), notFlag: ['found_bunker', 'skipped_follow'] }, text: 'Follow him into the forest, out through the back gate.', to: 'forest_path' },
  { if: { count: night(1) }, text: 'Go back to the inn and sleep in room 3.', to: 'inn' },
  { if: { count: day(2), notFlag: 'read_register' }, text: 'Go to the church after morning mass and ask the priest to see the register.', to: 'church', who: 'overney' },
  { if: { count: day(2), notFlag: ['suspects_empty_coffin', 'odile_talked'] }, text: "Visit the syndic's widow at the Gremaud house.", to: 'house_gremaud_kitchen', who: 'odile' },
  { if: { count: day(2), notFlag: 'suspects_empty_coffin' }, text: 'Ask the farmer at the Yerly farm about the coffin he carried.', to: 'yerly_farm', who: 'bernard' },
  { if: { count: day(2), notItem: 'shovel', flag: 'heifer_missing', notFlag: 'heifer_returned' }, text: "Find the farmer's lost heifer at the forest edge above the Yerly field and lead her home.", to: 'yerly_farm', who: 'marquise' },
  { if: { count: day(2), notItem: 'shovel' }, text: 'Go to the Yerly farm and ask the farmer for a spade.', to: 'yerly_farm', who: 'bernard' },
  { if: { count: day(2), flag: 'found_bunker', notFlag: 'found_hidden_door' }, text: 'Go back to the barn in the forest while it is light and search the bunker.', to: 'bunker_interior' },
  { if: { count: day(2), notFlag: 'found_hidden_door' }, text: 'Go into the forest past the cemetery while it is light.', to: 'bunker_interior' },
  { if: { count: day(2) }, text: 'Ask the innkeeper for supper. Then go to the Chassot grave.', to: 'inn', who: 'monique' },
  { if: { count: night(2), notFlag: 'opened_coffin' }, text: "Dig up Marc's side of the Chassot grave. Turn the torch off and hide when you hear the bell.", to: 'cemetery' },
  { if: { count: night(2), notItem: 'bunker_key' }, text: 'Open the box in the coffin.' },
  { if: { count: night(2), notFlag: 'grave_refilled' }, text: 'Fill the grave back in before the watchman sees it. Then go to bed.' },
  { if: { count: night(2) }, text: 'Go back to the inn and sleep.', to: 'inn' },
  { if: { count: day(3), notFlag: 'found_forest_grave', not: { flag: 'editor_called', item: 'food_parcel' } }, text: 'Climb the forest above the fort and find the larch from the letter.', to: 'forest_deep' },
  { if: { count: day(3), notFlag: 'met_veilleur', notItem: 'food_parcel' }, text: 'Buy bread at the dairy shop, or ask the innkeeper for food. Then go back to the inn.', to: 'laiterie', who: 'christine' },
  { if: { count: day(3), notFlag: 'met_veilleur' }, text: "Use the computer in the inn's back room before it gets dark.", to: 'inn' },
  { if: { count: night(3), notFlag: 'entered_hidden_room' }, text: 'Go to the K.P. 3 door in the bunker. Knock three times, wait, then once.', to: 'bunker_hidden' },
  { if: { count: night(3), notFlag: 'met_marc' }, text: 'Look around the room.' },
  { if: { flag: 'met_marc', count: [['day', '<=', 3]] }, text: 'Leave through the tunnel before it gets light.' },
  { if: { count: [['day', '==', 4]] }, text: "Call your editor from the phone in the inn's back room.", to: 'inn' },
];
