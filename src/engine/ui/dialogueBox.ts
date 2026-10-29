import { el, setVisible } from './dom';
import { ListMenu } from './listMenu';

const CHARACTERS_PER_SECOND = 42;

/** The text box at the bottom of the frame: speaker name, typewriter text, and choices. */
export class DialogueBox {
  readonly choices: ListMenu;
  private readonly box: HTMLElement;
  private readonly speaker: HTMLElement;
  private readonly text: HTMLElement;
  private readonly more: HTMLElement;
  private fullText = '';
  private shown = 0;

  constructor(parent: HTMLElement) {
    this.box = el('div', 'ui-dialogue', parent);
    this.speaker = el('div', 'ui-speaker', this.box);
    this.text = el('div', 'ui-text', this.box);
    this.choices = new ListMenu(this.box);
    this.more = el('div', 'ui-more', this.box);
    this.hide();
  }

  get typing(): boolean {
    return this.shown < this.fullText.length;
  }

  show(speaker: string | undefined, text: string, choices: string[] = []): void {
    setVisible(this.box, true);
    setVisible(this.speaker, Boolean(speaker));
    this.speaker.textContent = speaker ?? '';
    this.fullText = text;
    this.shown = 0;
    this.text.textContent = '';
    this.choices.set(choices);
    this.updateExtras(choices.length > 0);
  }

  /** Shows the rest of the line at once. */
  finishTyping(): void {
    this.shown = this.fullText.length;
    this.text.textContent = this.fullText;
    this.updateExtras(this.choices.element.children.length > 0);
  }

  update(dt: number): void {
    if (!this.typing) return;
    this.shown = Math.min(this.fullText.length, this.shown + dt * CHARACTERS_PER_SECOND);
    this.text.textContent = this.fullText.slice(0, Math.floor(this.shown));
    if (!this.typing) this.finishTyping();
  }

  hide(): void {
    setVisible(this.box, false);
  }

  private updateExtras(hasChoices: boolean): void {
    setVisible(this.choices.element, hasChoices && !this.typing);
    setVisible(this.more, !hasChoices && !this.typing);
  }
}
