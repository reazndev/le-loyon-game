import { apply, check, type Condition, type Effect, type StateMutator } from './conditions';

/** Where to go next. A list picks the first entry whose condition holds; no match ends the dialogue. */
export type Next = string | { if?: Condition; to: string }[];

export interface DialogueChoice {
  text: string;
  /** Hides the choice unless this holds. */
  if?: Condition;
  effects?: Effect;
  /** Omit to end the dialogue after this choice. */
  next?: Next;
}

export interface DialogueNode {
  speaker?: string;
  lines: string[];
  /** Applied when the node starts. */
  effects?: Effect;
  /** Shown with the last line, once it has been typed out. */
  choices?: DialogueChoice[];
  /** Used when the node has no visible choices. Omit to end the dialogue. */
  next?: Next;
}

export interface DialogueScript {
  start: Next;
  nodes: Record<string, DialogueNode>;
}

export type DialogueStep =
  | { kind: 'line'; speaker: string | undefined; text: string }
  | { kind: 'choice'; speaker: string | undefined; text: string | undefined; choices: string[] }
  | { kind: 'end' };

/**
 * Steps through a dialogue script. Pure logic: it reads and changes game state through
 * `StateMutator` and leaves display to the caller.
 */
export class DialogueRunner {
  private node: DialogueNode | null = null;
  private line = 0;
  private visibleChoices: DialogueChoice[] = [];
  private current: DialogueStep = { kind: 'end' };

  constructor(
    private readonly script: DialogueScript,
    private readonly state: StateMutator,
  ) {
    this.follow(script.start);
  }

  get step(): DialogueStep {
    return this.current;
  }

  /** Moves past the current line. Does nothing while a choice is waiting. */
  advance(): DialogueStep {
    if (this.current.kind !== 'line' || !this.node) return this.current;
    if (this.line + 1 < this.node.lines.length) {
      this.line++;
      return this.show();
    }
    return this.follow(this.node.next);
  }

  /** Picks a choice by its index in the step's `choices` list. */
  choose(index: number): DialogueStep {
    const choice = this.current.kind === 'choice' ? this.visibleChoices[index] : undefined;
    if (!choice) return this.current;
    apply(choice.effects, this.state);
    return this.follow(choice.next);
  }

  private follow(next: Next | undefined): DialogueStep {
    const id = resolve(next, this.state);
    if (id === null) return this.end();
    const node = this.script.nodes[id];
    if (!node) throw new Error(`Dialogue node "${id}" does not exist`);
    this.node = node;
    this.line = 0;
    apply(node.effects, this.state);
    // Conditions are checked once, after the node's own effects.
    this.visibleChoices = (node.choices ?? []).filter((c) => check(c.if, this.state));
    if (node.lines.length === 0 && this.visibleChoices.length === 0) return this.follow(node.next);
    return this.show();
  }

  private show(): DialogueStep {
    const node = this.node!;
    const isLast = this.line >= node.lines.length - 1;
    this.current =
      isLast && this.visibleChoices.length > 0
        ? { kind: 'choice', speaker: node.speaker, text: node.lines[this.line], choices: this.visibleChoices.map((c) => c.text) }
        : { kind: 'line', speaker: node.speaker, text: node.lines[this.line]! };
    return this.current;
  }

  private end(): DialogueStep {
    this.node = null;
    this.current = { kind: 'end' };
    return this.current;
  }
}

function resolve(next: Next | undefined, state: StateMutator): string | null {
  if (next === undefined) return null;
  if (typeof next === 'string') return next;
  return next.find((jump) => check(jump.if, state))?.to ?? null;
}

/** Lists jumps to nodes that don't exist. Content tests should expect an empty list. */
export function validateScript(script: DialogueScript): string[] {
  const targets = (next: Next | undefined): string[] =>
    next === undefined ? [] : typeof next === 'string' ? [next] : next.map((j) => j.to);
  const missing = (from: string, next: Next | undefined) =>
    targets(next)
      .filter((id) => !script.nodes[id])
      .map((id) => `${from} jumps to missing node "${id}"`);
  return [
    ...missing('start', script.start),
    ...Object.entries(script.nodes).flatMap(([id, node]) => [
      ...missing(id, node.next),
      ...(node.choices ?? []).flatMap((choice) => missing(`${id} choice "${choice.text}"`, choice.next)),
    ]),
  ];
}
