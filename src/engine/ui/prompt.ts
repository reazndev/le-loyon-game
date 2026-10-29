import { el, setVisible } from './dom';

/** The "[E] Open the door" hint shown when the player faces something usable. */
export class Prompt {
  private readonly element: HTMLElement;
  private readonly key: HTMLElement;
  private readonly label: HTMLElement;

  constructor(parent: HTMLElement) {
    this.element = el('div', 'ui-prompt', parent);
    this.key = el('span', 'ui-key', this.element);
    this.label = el('span', '', this.element);
    this.hide();
  }

  show(key: string, text: string): void {
    this.key.textContent = key;
    this.label.textContent = text;
    setVisible(this.element, true);
  }

  hide(): void {
    setVisible(this.element, false);
  }

  get text(): string | null {
    return this.element.classList.contains('ui-hidden') ? null : this.label.textContent;
  }
}
