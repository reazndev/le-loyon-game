/** Read access to the parts of game state that conditions test. */
export interface StateView {
  hasFlag(flag: string): boolean;
  hasItem(item: string): boolean;
  /** A numeric story value such as `day` or `marc_trust`. Unset counts are 0. */
  count(name: string): number;
}

export interface StateMutator extends StateView {
  setFlag(flag: string, on?: boolean): void;
  setCount(name: string, value: number): void;
  giveItem(item: string): void;
  takeItem(item: string): void;
}

type OneOrMany = string | string[];

export type Comparison = '==' | '!=' | '<' | '<=' | '>' | '>=';

/** `['marc_trust', '>=', 2]` holds when the count `marc_trust` is at least 2. */
export type CountTest = [name: string, op: Comparison, value: number];

/** Every field that is present must hold. `{}` always holds. */
export interface Condition {
  flag?: OneOrMany;
  notFlag?: OneOrMany;
  item?: OneOrMany;
  notItem?: OneOrMany;
  count?: CountTest[];
  /** At least one of these must hold. */
  any?: Condition[];
  /** All of these must hold. Use it to combine conditions without merging their fields. */
  all?: Condition[];
  not?: Condition;
}

/** Changes to game state, applied in the order set, clear, give, take, assign, add. */
export interface Effect {
  set?: OneOrMany;
  clear?: OneOrMany;
  give?: OneOrMany;
  take?: OneOrMany;
  /** Sets counts to these values. */
  assign?: Record<string, number>;
  /** Adds to counts. */
  add?: Record<string, number>;
}

const list = (value: OneOrMany | undefined): string[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

export function check(condition: Condition | undefined, state: StateView): boolean {
  if (!condition) return true;
  return (
    list(condition.flag).every((f) => state.hasFlag(f)) &&
    list(condition.notFlag).every((f) => !state.hasFlag(f)) &&
    list(condition.item).every((i) => state.hasItem(i)) &&
    list(condition.notItem).every((i) => !state.hasItem(i)) &&
    (condition.count ?? []).every(([name, op, value]) => compare(state.count(name), op, value)) &&
    (condition.any === undefined || condition.any.some((c) => check(c, state))) &&
    (condition.all ?? []).every((c) => check(c, state)) &&
    (condition.not === undefined || !check(condition.not, state))
  );
}

export function apply(effect: Effect | undefined, state: StateMutator): void {
  if (!effect) return;
  list(effect.set).forEach((f) => state.setFlag(f, true));
  list(effect.clear).forEach((f) => state.setFlag(f, false));
  list(effect.give).forEach((i) => state.giveItem(i));
  list(effect.take).forEach((i) => state.takeItem(i));
  Object.entries(effect.assign ?? {}).forEach(([name, value]) => state.setCount(name, value));
  Object.entries(effect.add ?? {}).forEach(([name, value]) => state.setCount(name, state.count(name) + value));
}

function compare(actual: number, op: Comparison, value: number): boolean {
  switch (op) {
    case '==':
      return actual === value;
    case '!=':
      return actual !== value;
    case '<':
      return actual < value;
    case '<=':
      return actual <= value;
    case '>':
      return actual > value;
    case '>=':
      return actual >= value;
  }
}
