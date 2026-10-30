export type Action =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'strafeLeft'
  | 'strafeRight'
  | 'turnLeft'
  | 'turnRight'
  | 'fast'
  | 'interact'
  | 'cancel'
  | 'inventory'
  | 'flashlight'
  | 'crouch'
  | 'camera'
  | 'pause';

/** Keyboard bindings by `KeyboardEvent.code`, so they follow key position on any layout. */
export const keyBindings: Record<string, Action[]> = {
  ArrowUp: ['up'],
  KeyW: ['up'],
  ArrowDown: ['down'],
  KeyS: ['down'],
  ArrowLeft: ['left', 'turnLeft'],
  KeyA: ['left', 'strafeLeft'],
  ArrowRight: ['right', 'turnRight'],
  KeyD: ['right', 'strafeRight'],
  ShiftLeft: ['fast'],
  ShiftRight: ['fast'],
  KeyE: ['interact'],
  Enter: ['interact'],
  Space: ['interact'],
  Tab: ['inventory'],
  KeyI: ['inventory'],
  KeyF: ['flashlight'],
  KeyC: ['crouch'],
  ControlLeft: ['crouch'],
  KeyQ: ['camera'],
  Escape: ['pause', 'cancel'],
  Backspace: ['cancel'],
};

/** Gamepad bindings by button index in the browser's standard mapping. */
export const gamepadBindings: Record<number, Action[]> = {
  0: ['interact'],
  1: ['cancel'],
  2: ['flashlight'],
  3: ['inventory'],
  4: ['crouch'],
  5: ['fast'],
  6: ['camera'],
  7: ['fast'],
  9: ['pause'],
  12: ['up'],
  13: ['down'],
  14: ['left', 'turnLeft'],
  15: ['right', 'turnRight'],
};

/** Mouse bindings by `MouseEvent.button`. They only count while the pointer is locked to the game. */
export const mouseBindings: Record<number, Action[]> = {
  0: ['interact'],
};

/** Prompt labels for the interact button on each device. */
export const interactLabel = { keyboard: 'E', gamepad: 'A' } as const;

/** Prompt labels for the cancel button on each device. */
export const cancelLabel = { keyboard: 'Esc', gamepad: 'B' } as const;
