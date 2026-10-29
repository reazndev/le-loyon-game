export type Action =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'fast'
  | 'interact'
  | 'cancel'
  | 'inventory'
  | 'flashlight'
  | 'pause';

/** Keyboard bindings by `KeyboardEvent.code`, so they follow key position on any layout. */
export const keyBindings: Record<string, Action[]> = {
  ArrowUp: ['up'],
  KeyW: ['up'],
  ArrowDown: ['down'],
  KeyS: ['down'],
  ArrowLeft: ['left'],
  KeyA: ['left'],
  ArrowRight: ['right'],
  KeyD: ['right'],
  ShiftLeft: ['fast'],
  ShiftRight: ['fast'],
  KeyE: ['interact'],
  Enter: ['interact'],
  Space: ['interact'],
  Tab: ['inventory'],
  KeyI: ['inventory'],
  KeyF: ['flashlight'],
  Escape: ['pause', 'cancel'],
  Backspace: ['cancel'],
};

/** Gamepad bindings by button index in the browser's standard mapping. */
export const gamepadBindings: Record<number, Action[]> = {
  0: ['interact'],
  1: ['cancel'],
  2: ['flashlight'],
  3: ['inventory'],
  5: ['fast'],
  7: ['fast'],
  9: ['pause'],
  12: ['up'],
  13: ['down'],
  14: ['left'],
  15: ['right'],
};

/** Prompt labels for the interact button on each device. */
export const interactLabel = { keyboard: 'E', gamepad: 'A' } as const;
