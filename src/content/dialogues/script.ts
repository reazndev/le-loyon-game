import type { Condition } from '../../game/conditions';
import type { DialogueChoice, DialogueNode, Next } from '../../game/dialogue';
import { expandDerived } from '../flags';

/**
 * A node as the script writes it. `if` makes the node available only while it holds, as `?if:` does in
 * the script convention. The engine has no node conditions, so `compile` moves them onto every jump,
 * choice, and entry that leads to the node.
 */
export interface ScriptNode extends DialogueNode {
  if?: Condition;
}

/** Which node opens when the player talks to someone. The first row whose condition holds wins. */
export type EntryTable = { if?: Condition; to: string }[];

export interface Compiled {
  nodes: Record<string, DialogueNode>;
  /** A `start` that opens at `id`, or ends at once if the node's condition fails. */
  startAt(id: string): Next;
  /** A `start` that follows an entry table. */
  entry(table: EntryTable): Next;
}

const both = (a: Condition | undefined, b: Condition | undefined): Condition | undefined =>
  a && b ? { all: [a, b] } : (a ?? b);

/** Turns script nodes into engine nodes, with node conditions moved onto jumps and derived flags expanded. */
export function compile(script: Record<string, ScriptNode>): Compiled {
  const jump = (to: string, condition?: Condition) => {
    const guard = both(condition, script[to]?.if);
    return guard ? { if: expandDerived(guard), to } : { to };
  };
  const next = (value: Next | undefined): Next | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === 'string') return script[value]?.if ? [jump(value)] : value;
    return value.map((j) => jump(j.to, j.if));
  };
  // A choice that leads to a guarded node is hidden while the guard fails, instead of ending the dialogue.
  const choice = ({ if: condition, next: to, ...rest }: DialogueChoice): DialogueChoice => {
    const guard = typeof to === 'string' ? both(condition, script[to]?.if) : condition;
    return {
      ...rest,
      ...(guard ? { if: expandDerived(guard) } : {}),
      ...(to === undefined ? {} : { next: typeof to === 'string' ? to : next(to) }),
    };
  };
  const node = ({ if: _, next: to, choices, lines, ...rest }: ScriptNode): DialogueNode => {
    const compiledNext = next(to);
    return {
      ...rest,
      lines: lines.map((l) => (typeof l === 'string' ? l : { ...l, if: expandDerived(l.if) })),
      ...(choices ? { choices: choices.map(choice) } : {}),
      ...(compiledNext === undefined ? {} : { next: compiledNext }),
    };
  };
  return {
    nodes: Object.fromEntries(Object.entries(script).map(([id, n]) => [id, node(n)])),
    startAt: (id) => next(id)!,
    entry: (table) => table.map((row) => jump(row.to, row.if)),
  };
}
