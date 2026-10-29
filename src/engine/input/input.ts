import { gamepadBindings, keyBindings, type Action } from './bindings';

export type InputDevice = 'keyboard' | 'gamepad';

export interface Movement {
  /** -1 is full reverse, 1 is full forward. */
  forward: number;
  /** -1 turns left, 1 turns right. */
  turn: number;
}

const STICK_DEADZONE = 0.25;
const STICK_AS_BUTTON = 0.55;

/**
 * Merges keyboard, gamepad, and simulated input into actions. Call `update` once per frame;
 * `pressed` then reports actions that went down since the previous frame.
 */
export class Input {
  lastDevice: InputDevice = 'keyboard';
  private readonly keysDown = new Set<string>();
  private readonly keysTapped = new Set<string>();
  private readonly simulated = new Set<Action>();
  private held = new Set<Action>();
  /** Held actions from buttons and keys only, so stick-driven directions stay analog. */
  private buttons = new Set<Action>();
  private previous = new Set<Action>();
  private stick = { x: 0, y: 0 };

  constructor(target: Window = window) {
    target.addEventListener('keydown', (event) => {
      if (!keyBindings[event.code]) return;
      event.preventDefault();
      this.lastDevice = 'keyboard';
      if (!event.repeat) this.keysTapped.add(event.code);
      this.keysDown.add(event.code);
    });
    target.addEventListener('keyup', (event) => this.keysDown.delete(event.code));
    target.addEventListener('blur', () => this.keysDown.clear());
  }

  update(): void {
    this.previous = this.held;
    const held = new Set<Action>(this.simulated);
    // A key pressed and released between two frames still counts as one press.
    for (const code of [...this.keysDown, ...this.keysTapped]) keyBindings[code]?.forEach((a) => held.add(a));
    this.keysTapped.clear();
    const pad = navigator.getGamepads?.().find((p) => p?.connected) ?? null;
    this.readButtons(pad, held);
    this.buttons = new Set(held);
    this.readStick(pad, held);
    this.held = held;
  }

  isDown(action: Action): boolean {
    return this.held.has(action);
  }

  pressed(action: Action): boolean {
    return this.held.has(action) && !this.previous.has(action);
  }

  movement(): Movement {
    const keys = (positive: Action, negative: Action) =>
      (this.buttons.has(positive) ? 1 : 0) - (this.buttons.has(negative) ? 1 : 0);
    const pick = (digital: number, analog: number) => (Math.abs(analog) > Math.abs(digital) ? analog : digital);
    return {
      forward: pick(keys('up', 'down'), -this.stick.y),
      turn: pick(keys('right', 'left'), this.stick.x),
    };
  }

  /** Holds or releases an action as if a button were pressed. For tests and scripted input. */
  simulate(action: Action, down: boolean): void {
    if (down) this.simulated.add(action);
    else this.simulated.delete(action);
  }

  private readButtons(pad: Gamepad | null, held: Set<Action>): void {
    pad?.buttons.forEach((button, index) => {
      if (!button.pressed) return;
      gamepadBindings[index]?.forEach((a) => held.add(a));
      this.lastDevice = 'gamepad';
    });
  }

  private readStick(pad: Gamepad | null, held: Set<Action>): void {
    const deadzone = (v: number) =>
      Math.abs(v) < STICK_DEADZONE ? 0 : (v - Math.sign(v) * STICK_DEADZONE) / (1 - STICK_DEADZONE);
    this.stick = { x: deadzone(pad?.axes[0] ?? 0), y: deadzone(pad?.axes[1] ?? 0) };
    if (this.stick.x || this.stick.y) this.lastDevice = 'gamepad';
    // The stick also drives menus, so it maps to the direction actions past a threshold.
    if (this.stick.y < -STICK_AS_BUTTON) held.add('up');
    if (this.stick.y > STICK_AS_BUTTON) held.add('down');
    if (this.stick.x < -STICK_AS_BUTTON) held.add('left');
    if (this.stick.x > STICK_AS_BUTTON) held.add('right');
  }
}
