import type { Input } from '../input/input';
import { el } from './dom';

/** A vertical list with one selected entry, driven by up, down, and interact. */
export class ListMenu {
  readonly element: HTMLUListElement;
  selected = 0;
  private count = 0;
  onSelect: (index: number) => void = () => undefined;

  constructor(parent: HTMLElement) {
    this.element = el('ul', 'ui-list', parent);
  }

  set(items: string[], selected = 0): void {
    this.element.replaceChildren(
      ...items.map((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
      }),
    );
    this.count = items.length;
    this.select(Math.min(selected, Math.max(items.length - 1, 0)));
  }

  /** Moves the selection and returns the selected index when the player confirms. */
  handle(input: Input): number | null {
    if (this.count === 0) return null;
    if (input.pressed('up')) this.select((this.selected - 1 + this.count) % this.count);
    if (input.pressed('down')) this.select((this.selected + 1) % this.count);
    return input.pressed('interact') ? this.selected : null;
  }

  private select(index: number): void {
    this.selected = index;
    [...this.element.children].forEach((child, i) => child.classList.toggle('selected', i === index));
    if (this.count > 0) this.onSelect(index);
  }
}
