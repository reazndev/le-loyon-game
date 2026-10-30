import type { DialogueScript } from '../../game/dialogue';
import * as bernard from './bernard';
import * as brodard from './brodard';
import * as cemetery from './cemetery';
import * as christine from './christine';
import * as church from './church';
import * as dig from './dig';
import * as driver from './driver';
import * as ending from './ending';
import * as forest from './forest';
import * as fort from './fort';
import * as fortNotes from './fortNotes';
import * as gilles from './gilles';
import * as graveLooks from './graveLooks';
import * as hiddenRoom from './hiddenRoom';
import * as home from './home';
import * as houses from './houses';
import * as josiane from './josiane';
import * as kolly from './kolly';
import * as marc from './marc';
import * as monique from './monique';
import * as odile from './odile';
import * as overney from './overney';
import * as phone from './phone';
import * as photos from './photos';
import * as raymond from './raymond';
import * as room3 from './room3';
import { compile, type EntryTable, type ScriptNode } from './script';
import * as simone from './simone';
import * as square from './square';
import * as yannick from './yannick';

const areas = [
  home, driver, square, monique, yannick, gilles, bernard, christine, odile, phone, room3, houses,
  church, overney, cemetery, graveLooks, raymond, dig, forest, fort, hiddenRoom, marc, ending, photos,
  simone, josiane, brodard, kolly, fortNotes,
] as const;

/** Entry tables, keyed by the cast id of the person the player talks to. */
export const entries = { monique: monique.entry, yannick: yannick.entry, gilles: gilles.entry, bernard: bernard.entry,
  christine: christine.entry, odile: odile.entry, overney: overney.entry, simone: simone.entry, josiane: josiane.entry,
  germaine: kolly.entry } satisfies Record<string, EntryTable>;

type NodeIdOf<T> = T extends { nodes: infer N } ? Extract<keyof N, string> : never;
/** Every node id from the script. Speaker continuations (`<id>.2`) are internal and left out. */
export type NodeId = Exclude<NodeIdOf<(typeof areas)[number]>, `${string}.${string}`>;
export type EntryId = keyof typeof entries;

/** Every node as the script wrote it, with its `if`. For content tests. */
export const scriptNodes: Record<string, ScriptNode> = Object.assign({}, ...areas.map((area) => area.nodes));

const compiled = compile(scriptNodes);
const scriptFrom = (start: DialogueScript['start']): DialogueScript => ({ start, nodes: compiled.nodes });

/**
 * `dialogues[nodeId]` plays from that node; it ends at once if the node's `?if:` fails.
 * `dialogues[castId]` follows the person's entry table, for example `dialogues.monique`.
 */
export const dialogues = {
  ...Object.fromEntries(
    Object.keys(scriptNodes)
      .filter((id) => !id.includes('.'))
      .map((id) => [id, scriptFrom(compiled.startAt(id))]),
  ),
  ...Object.fromEntries(Object.entries(entries).map(([id, table]) => [id, scriptFrom(compiled.entry(table))])),
} as Record<NodeId | EntryId, DialogueScript>;
