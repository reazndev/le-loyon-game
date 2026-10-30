import type { Computer } from '../computer';
import { h } from '../dom';
import { icon } from '../gfx/icons';
import { checklistLine, nextHint, notesText, progressSteps } from '../progress';
import { ScrollPane } from '../ui/scrollPane';
import type { AppWindow } from '../ui/window';

const TYPING_SPEED = 38;
/** Seconds without progress before the notes point to the next clue. */
const IDLE_HINT = 60;

/**
 * notes.txt in the Editor. Lines added since the file was last open type themselves in. Once
 * Ruth's mail is read, a strip above the taskbar keeps the checklist of what is still unknown in
 * view, and points to the next clue when the player makes no progress for a minute.
 */
export class NotesApp {
  readonly strip: HTMLElement;
  private win: AppWindow | null = null;
  private readonly pane = new ScrollPane();
  private readonly text = h('pre', { style: 'margin:0;padding:4px 6px;font:inherit;white-space:pre-wrap' });
  private readonly caret = h('span', 'blink', '_');
  private readonly stripText = h('span', 'pc-strip-text');
  /** Characters on screen. -1 until the file is first opened. */
  private shown = -1;
  private steps = -1;
  private idle = 0;
  private hint: string | null = null;
  private hintTyped = 0;

  constructor(private readonly pc: Computer) {
    this.pane.content.append(this.text);
    this.strip = h('div', { class: 'pc-strip', onClick: () => this.open() }, icon('text'), h('span', null, 'notes.txt'), this.stripText);
    this.strip.hidden = true;
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
    this.updateStrip(dt);
    if (!this.win || this.shown < 0) return;
    const full = notesText(this.pc.state);
    const typing = this.shown < full.length;
    this.shown = Math.min(full.length, this.shown + (typing ? dt * TYPING_SPEED : 0));
    const visible = full.slice(0, Math.floor(this.shown));
    if (this.text.firstChild?.textContent === visible) return;
    this.text.replaceChildren(visible, this.caret);
    if (typing) this.pane.scrollTo(1e6);
  }

  private updateStrip(dt: number): void {
    const { state } = this.pc;
    const steps = progressSteps(state);
    if (steps !== this.steps) {
      this.steps = steps;
      this.idle = 0;
      this.hint = null;
    } else if (!this.hint && (this.idle += dt) >= IDLE_HINT) {
      this.hint = nextHint(state);
      this.hintTyped = 0;
    }
    this.strip.hidden = !state.hasFlag('pro_read_mail') && !this.hint;
    const line = checklistLine(state, this.hint);
    // A new hint types itself in, the way the reporter would write it.
    const typed = this.hint ? line.length - this.hint.length + Math.floor((this.hintTyped += dt * TYPING_SPEED)) : line.length;
    const text = line.slice(0, typed);
    if (this.stripText.textContent !== text) this.stripText.textContent = text;
  }
}
