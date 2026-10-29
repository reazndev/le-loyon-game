import './ui.css';
import { DialogueBox } from './dialogueBox';
import { el, fadeOpacity } from './dom';
import { MenuScreen } from './menuScreen';
import { Prompt } from './prompt';

/** The UI layer over the 3D frame, in 640x480 frame pixels. */
export class Overlay {
  readonly root: HTMLElement;
  readonly prompt: Prompt;
  readonly dialogue: DialogueBox;
  readonly menu: MenuScreen;
  private readonly notice: HTMLElement;
  private readonly fader: HTMLElement;
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(frame: HTMLElement) {
    this.root = el('div', 'ui', frame);
    this.prompt = new Prompt(this.root);
    this.notice = el('div', 'ui-notice', this.root);
    this.dialogue = new DialogueBox(this.root);
    this.menu = new MenuScreen(this.root);
    // Last, so the fade covers everything else.
    this.fader = el('div', 'ui-fade', this.root);
  }

  /** Fades the frame to black (1) or back (0). */
  fade(to: number, seconds: number): Promise<void> {
    return fadeOpacity(this.fader, to, seconds);
  }

  /** Shows a short line in the corner, such as "Got: Brass key". */
  notify(text: string, seconds = 3): void {
    this.notice.textContent = text;
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    void fadeOpacity(this.notice, 1, 0.3);
    this.noticeTimer = setTimeout(() => void fadeOpacity(this.notice, 0, 0.8), seconds * 1000);
  }
}
