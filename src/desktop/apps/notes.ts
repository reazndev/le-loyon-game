import type { Computer } from '../computer';
import { h } from '../dom';
import { notesText } from '../progress';
import { ScrollPane } from '../ui/scrollPane';
import type { AppWindow } from '../ui/window';

const TYPING_SPEED = 38;

/** notes.txt in the Editor. Lines added since the file was last open type themselves in. */
export class NotesApp {
  private win: AppWindow | null = null;
  private readonly pane = new ScrollPane();
  private readonly text = h('pre', { style: 'margin:0;padding:4px 6px;font:inherit;white-space:pre-wrap' });
  private readonly caret = h('span', 'blink', '_');
  /** Characters on screen. -1 until the file is first opened. */
  private shown = -1;

  constructor(private readonly pc: Computer) {
    this.pane.content.append(this.text);
  }

  open(): void {
    if (!this.win) {
      this.win = this.pc.windows.create({
        title: 'notes.txt - Editor',
        icon: 'text',
        at: { x: 96, y: 40, w: 536, h: 320 },
        menu: ['File', 'Edit', 'Search', 'Help'],
        onClose: () => (this.win = null),
        focus: () => ({ items: [], pane: this.pane }),
      });
      this.win.body.append(h('div', { class: 'sunken', style: 'flex:1;display:flex;padding:2px' }, this.pane.element));
    }
    if (this.shown < 0) this.shown = notesText(this.pc.state).length;
    this.pc.windows.open(this.win);
    this.update(0);
  }

  update(dt: number): void {
    if (!this.win || this.shown < 0) return;
    const full = notesText(this.pc.state);
    const typing = this.shown < full.length;
    this.shown = Math.min(full.length, this.shown + (typing ? dt * TYPING_SPEED : 0));
    const visible = full.slice(0, Math.floor(this.shown));
    if (this.text.firstChild?.textContent === visible) return;
    this.text.replaceChildren(visible, this.caret);
    if (typing) this.pane.scrollTo(1e6);
  }
}
