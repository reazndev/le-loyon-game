import { el, setVisible } from './dom';

/** The window the photo is cut from, in frame pixels. The camera crops the same square. */
export const VIEWFINDER = { x: 128, y: 48, size: 384 } as const;

/** The camera held to the eye: a square window with a dark surround and the film counter. */
export class Viewfinder {
  readonly element: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly hint: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ui-viewfinder';
    const window = el('div', 'ui-vf-window', this.element);
    Object.assign(window.style, {
      left: `${VIEWFINDER.x}px`,
      top: `${VIEWFINDER.y}px`,
      width: `${VIEWFINDER.size}px`,
      height: `${VIEWFINDER.size}px`,
    });
    ['tl', 'tr', 'bl', 'br'].forEach((corner) => el('div', `ui-vf-corner ${corner}`, window));
    el('div', 'ui-vf-center', window);
    this.counter = el('div', 'ui-vf-counter', this.element);
    this.hint = el('div', 'ui-vf-hint', this.element);
  }

  set shots(count: number) {
    this.counter.textContent = String(count);
  }

  /** Key hints such as `[['E', 'Shoot'], ['Esc', 'Lower']]`, or none while the camera is busy. */
  set hints(hints: [key: string, label: string][]) {
    this.hint.replaceChildren(
      ...hints.map(([key, label]) => {
        const hint = document.createElement('span');
        el('span', 'ui-key', hint).textContent = key;
        hint.append(label);
        return hint;
      }),
    );
    setVisible(this.hint, hints.length > 0);
  }
}
