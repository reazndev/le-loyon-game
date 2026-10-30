import type { Condition } from '../game/conditions';
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
    text: 'Three graves. Daniel Menoud, suicide, Dec 96. J.-P. Gremaud, syndic, vanished Jan 97, stone, no body. Marc Chassot, died abroad 95, coffin came home sealed.',
  },
  met_gilles: { text: "Gilles saw him 'staring at a grave'. Back row." },
  bunker_door_wedged: {
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
  suspects_empty_coffin: { text: "Marc Chassot's coffin. The syndic handed it over. It was light. What was in it?" },
  found_hidden_door: { text: 'A steel door behind a cupboard. K.P. 3. Locked. Candle smoke.' },
  read_gremaud_letter: {
    text: `Gremaud. He knew. The coffin was empty from the start.
"K.P. 3." The room at the end of the fort.
Knock three times, wait, then once.
Bread. The larch above the fort.
CHALLAND M. Who is Challand?`,
  },
  found_forest_grave: {
    text: 'Gremaud is under the larch. Someone buried him and marked it. Someone who goes up and down past that hatch every day.',
  },
  editor_called: { text: 'Ruth. Friday before ten. A name and a photo.' },
  met_veilleur: { text: "veilleur = Yannick. Sixteen. He's seen him seven times." },
} satisfies Partial<Record<Flag, NotebookEntry>>;
