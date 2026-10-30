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
}

const day = (n: number): CountTest[] => [['day', n === 1 ? '<=' : '==', n], ['night', '==', 0]];
const night = (n: number): CountTest[] => [['night', '==', n]];

/**
 * What the reporter means to do next, shown at the top of the notebook. The first goal whose
 * condition holds is the one shown, so each day lists its unfinished steps in the order to take them.
 */
export const notebookGoals: NotebookGoal[] = [
  { if: { count: day(1), notFlag: 'inn_checked_in' }, text: 'A room at the inn first. It is on the square.' },
  { if: { count: day(1), notFlag: 'abbe_told_graves' }, text: 'The church. A priest knows who is buried where.' },
  { if: { count: day(1), notFlag: 'dinner_day1' }, text: 'Ask around the village. Then supper at the inn.' },
  { if: { count: night(1), not: { flag: ['read_grave_menoud', 'read_grave_gremaud', 'read_grave_chassot'] } }, text: 'Tonight. The cemetery. The three graves the abbé told me about.' },
  { if: { count: night(1), notFlag: ['met_raymond', 'first_sighting', 'skipped_follow', 'found_bunker'] }, text: 'All three read. Wait here. Listen.' },
  { if: { count: night(1), notFlag: ['first_sighting', 'skipped_follow', 'found_bunker'] }, text: 'Stay a while. Watch the back wall, by the forest.' },
  { if: { count: night(1), notFlag: ['found_bunker', 'skipped_follow'] }, text: 'It went out by the back gate. Follow it.' },
  { if: { count: night(1) }, text: 'Back to the inn. Room 3. Sleep.' },
  { if: { count: day(2), notFlag: 'read_register' }, text: 'After mass, the abbé said. The parish register.' },
  { if: { count: day(2), notFlag: 'suspects_empty_coffin' }, text: "That coffin. The register names who carried it. The syndic's widow might open her door now." },
  { if: { count: day(2), notItem: 'shovel', flag: 'heifer_missing', notFlag: 'heifer_returned' }, text: 'Tonight. The Chassot grave. Need a spade. Yerly, once his heifer is home.' },
  { if: { count: day(2), notItem: 'shovel' }, text: 'Tonight. The Chassot grave. Need a spade. Try the Yerly farm.' },
  { if: { count: day(2), flag: 'found_bunker', notFlag: 'found_hidden_door' }, text: 'The barn in the woods, while it is light. Then supper, and the grave.' },
  { if: { count: day(2), notFlag: 'found_hidden_door' }, text: 'The forest past the cemetery, while it is light. Then supper, and the grave.' },
  { if: { count: day(2) }, text: 'Supper at the inn. Then the Chassot grave.' },
  { if: { count: night(2), notFlag: 'opened_coffin' }, text: "The Chassot grave. Marc's side. Torch off when I hear the bell." },
  { if: { count: night(2), notItem: 'bunker_key' }, text: 'There is a box in the coffin.' },
  { if: { count: night(2), notFlag: 'grave_refilled' }, text: 'Fill it in before the watchman sees it. Then bed.' },
  { if: { count: night(2) }, text: 'Back to the inn. Sleep.' },
  { if: { count: day(3), notFlag: 'found_forest_grave', not: { flag: 'editor_called', item: 'food_parcel' } }, text: 'The larch above the fort. The letter says so.' },
  { if: { count: day(3), notFlag: 'met_veilleur', notItem: 'food_parcel' }, text: 'Bread for him, the letter says. Christine sells it, or ask Monique. Then the inn.' },
  { if: { count: day(3), notFlag: 'met_veilleur' }, text: 'Back to the inn. The board, before it gets dark.' },
  { if: { count: night(3), notFlag: 'entered_hidden_room' }, text: 'K.P. 3. Knock three times, wait, then once.' },
  { if: { count: night(3), notFlag: 'met_marc' }, text: 'He lives in here. Look around.' },
  { if: { flag: 'met_marc', count: [['day', '<=', 3]] }, text: 'Out through the tunnel before it gets light.' },
  { if: { count: [['day', '==', 4]] }, text: 'Ruth. Before ten. The phone in the back room.' },
];
