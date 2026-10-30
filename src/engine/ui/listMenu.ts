import type { Input } from '../input/input';
import { el } from './dom';

/** A list entry with a setting shown on the right: a bar for a 0 to 1 level, or text such as "On". */
export interface ListRow {
  label: string;
  value?: number | string;
}

/** A vertical list with one selected entry, driven by up, down, and interact. */
export class ListMenu {
  readonly element: HTMLUListElement;
  selected = 0;
  private count = 0;
  onSelect: (index: number) => void = () => undefined;

  constructor(parent: HTMLElement) {
    this.element = el('ul', 'ui-list', parent);
  }

  set(items: (string | ListRow)[], selected = 0): void {
    this.element.replaceChildren(...items.map((item) => row(typeof item === 'string' ? { label: item } : item)));
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

function row({ label, value }: ListRow): HTMLLIElement {
  const item = document.createElement('li');
  item.textContent = label;
  if (typeof value === 'string') el('span', 'ui-row-value', item).textContent = value;
  if (typeof value === 'number') {
    const bar = el('span', 'ui-row-value ui-bar', item);
    el('span', 'ui-bar-fill', bar).style.width = `${Math.round(value * 100)}%`;
  }
  return item;
}
