import { click } from '../engine/audio/generators';
import { cancelLabel, interactLabel } from '../engine/input/bindings';
import type { InputDevice } from '../engine/input/input';
import type { SceneContext } from './scene';

export interface CombinationLockOptions {
  /** The digits the wheels show when the view opens, such as the last code tried. Default all zeros. */
  start?: string;
  /** Runs on interact with the code on the wheels. The view closes when it returns true. */
  tryCode(code: string): boolean | Promise<boolean>;
}

const WHEELS = 4;
const BRASS = '#b08a3e';

const roll = (digit: number, by: number) => (digit + by + 10) % 10;
const keysFor = (device: InputDevice) => `Up, down: turn   Left, right: wheel   [${interactLabel[device]}] Try   [${cancelLabel[device]}] Back`;

/**
 * A padlock with four brass wheels, close up. Up and down roll the selected wheel, left and
 * right move between wheels, interact tries the code, cancel closes. Resolves with the code that
 * opened it, or null when the player backs out.
 */
export function combinationLock(ctx: SceneContext, options: CombinationLockOptions): Promise<string | null> {
  const digits = Array.from({ length: WHEELS }, (_, i) => Number(options.start?.[i] ?? 0) || 0);
  let selected = 0;
  let trying = false;

  const screen = document.createElement('div');
  screen.style.cssText =
    'position:absolute;inset:0;background:rgba(0,0,0,0.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px';
  const body = document.createElement('div');
  body.style.cssText = `display:flex;gap:10px;padding:18px 22px;background:#3a3226;border:2px solid ${BRASS};border-top-width:14px;border-radius:34px 34px 6px 6px`;
  const wheels = digits.map(() => {
    const wheel = document.createElement('div');
    wheel.style.cssText = 'width:40px;display:flex;flex-direction:column;align-items:center;background:#6e5528;padding:4px 0;line-height:26px';
    body.append(wheel);
    return wheel;
  });
  const keys = document.createElement('div');
  keys.style.cssText = 'color:#8a8274;white-space:pre';
  keys.textContent = keysFor('keyboard');
  screen.append(body, keys);

  const draw = () => {
    wheels.forEach((wheel, i) => {
      const d = digits[i]!;
      wheel.style.outline = i === selected ? '2px solid #e8dcb0' : 'none';
      wheel.innerHTML = '';
      [roll(d, -1), d, roll(d, 1)].forEach((n, row) => {
        const cell = document.createElement('div');
        cell.textContent = String(n);
        cell.style.color = row === 1 ? '#f0e2b0' : '#4a3a1c';
        wheel.append(cell);
      });
    });
  };
  draw();

  return new Promise((resolve) => {
    const handle = ctx.openScreen(screen, (_dt, input) => {
      if (trying || !handle.onTop) return;
      keys.textContent = keysFor(input.lastDevice);
      if (input.pressed('cancel')) {
        handle.close();
        resolve(null);
        return;
      }
      const turn = input.pressed('up') ? 1 : input.pressed('down') ? -1 : 0;
      const move = input.pressed('right') ? 1 : input.pressed('left') ? -1 : 0;
      if (turn) {
        digits[selected] = roll(digits[selected]!, turn);
        click(ctx.audio, { volume: 0.18 });
      }
      if (move) selected = (selected + move + WHEELS) % WHEELS;
      if (turn || move) draw();
      if (!input.pressed('interact')) return;
      const code = digits.join('');
      trying = true;
      void Promise.resolve(options.tryCode(code)).then((open) => {
        trying = false;
        if (!open) return;
        handle.close();
        resolve(code);
      });
    });
  });
}
