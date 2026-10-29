/** Read access to the parts of game state that conditions test. */
export interface StateView {
  hasFlag(flag: string): boolean;
  hasItem(item: string): boolean;
}

export interface StateMutator extends StateView {
  setFlag(flag: string, on?: boolean): void;
  giveItem(item: string): void;
  takeItem(item: string): void;
}

type OneOrMany = string | string[];

/** Every field that is present must hold. `{}` always holds. */
export interface Condition {
  flag?: OneOrMany;
  notFlag?: OneOrMany;
  item?: OneOrMany;
  notItem?: OneOrMany;
  /** At least one of these must hold. */
  any?: Condition[];
  not?: Condition;
}

/** Changes to game state, applied in the order set, clear, give, take. */
export interface Effect {
  set?: OneOrMany;
  clear?: OneOrMany;
  give?: OneOrMany;
  take?: OneOrMany;
}

const list = (value: OneOrMany | undefined): string[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

export function check(condition: Condition | undefined, state: StateView): boolean {
  if (!condition) return true;
  return (
    list(condition.flag).every((f) => state.hasFlag(f)) &&
    list(condition.notFlag).every((f) => !state.hasFlag(f)) &&
    list(condition.item).every((i) => state.hasItem(i)) &&
    list(condition.notItem).every((i) => !state.hasItem(i)) &&
    (condition.any === undefined || condition.any.some((c) => check(c, state))) &&
    (condition.not === undefined || !check(condition.not, state))
  );
}

export function apply(effect: Effect | undefined, state: StateMutator): void {
  if (!effect) return;
  list(effect.set).forEach((f) => state.setFlag(f, true));
  list(effect.clear).forEach((f) => state.setFlag(f, false));
  list(effect.give).forEach((i) => state.giveItem(i));
  list(effect.take).forEach((i) => state.takeItem(i));
}
