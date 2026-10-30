import { h } from '../dom';
import { icon, modemLight } from '../gfx/icons';
import type { WindowManager } from './window';

/** The bar at the bottom: Start, a button per window, the modem light, and the clock. */
export class Taskbar {
  readonly element: HTMLDivElement;
  readonly startButton: HTMLDivElement;
  private readonly tasks = h('div', 'pc-tasks');
  private readonly light = h('span');
  private readonly clock = h('span');
  private lightPhase = -1;

  constructor(
    private readonly windows: WindowManager,
    onStart: () => void,
  ) {
    this.startButton = h('div', { class: 'btn pc-start', onClick: onStart }, icon('start'), 'Start');
    this.element = h('div', 'pc-taskbar', this.startButton, this.tasks, h('div', 'pc-tray', this.light, this.clock));
  }

  refresh(): void {
    const active = this.windows.active;
    this.tasks.replaceChildren(
      ...this.windows.windows.map((win) =>
        h(
          'div',
          {
            class: `btn pc-task${win === active ? ' active down' : ''}`,
            onClick: () => (win === active ? this.windows.minimize(win) : this.windows.focus(win)),
          },
          icon(win.icon),
          h('span', null, win.title),
        ),
      ),
    );
  }

  setClock(text: string): void {
    if (this.clock.textContent !== text) this.clock.textContent = text;
  }

  /** `phase` -1 hides the modem light; 0 and 1 flash its two screens. */
  setModem(phase: -1 | 0 | 1): void {
    if (phase === this.lightPhase) return;
    this.lightPhase = phase;
    this.light.replaceChildren(...(phase < 0 ? [] : [modemLight(phase)]));
  }
}
