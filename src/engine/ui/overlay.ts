import './ui.css';
import { fitFrame } from '../render/frame';
import { DialogueBox } from './dialogueBox';
import { DocumentView } from './documentView';
import { el, fadeOpacity } from './dom';
import { MenuScreen } from './menuScreen';
import { PhotoView } from './photoView';
import { Prompt } from './prompt';

/** The UI layer over the 3D frame, in 640x480 frame pixels. */
export class Overlay {
  readonly root: HTMLElement;
  /** Full-frame screens such as a computer desktop, under every other UI element. */
  readonly screens: HTMLElement;
  readonly prompt: Prompt;
  readonly menu: MenuScreen;
  readonly photo: PhotoView;
  readonly document: DocumentView;
  readonly dialogue: DialogueBox;
  private readonly notice: HTMLElement;
  private readonly goal: HTMLElement;
  private readonly flashLayer: HTMLElement;
  private readonly fader: HTMLElement;
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(frame: HTMLElement) {
    this.root = el('div', 'ui', frame);
    this.screens = el('div', 'ui-screens', this.root);
    this.prompt = new Prompt(this.root);
    this.menu = new MenuScreen(this.root);
    // Photos and documents open from the inventory, and dialogue can comment on them.
    this.photo = new PhotoView(this.root);
    this.document = new DocumentView(this.root);
    this.dialogue = new DialogueBox(this.root);
    this.goal = el('div', 'ui-goal', this.root);
    this.notice = el('div', 'ui-notice', this.root);
    this.flashLayer = el('div', 'ui-flash', this.root);
    // Last, so the fade covers everything else.
    this.fader = el('div', 'ui-fade', this.root);
    keepTextCrisp(this.root);
  }

  /** Whether the English under French lines and documents shows. */
  set subtitles(on: boolean) {
    this.dialogue.subtitles = on;
    this.document.subtitles = on;
  }

  /** Fades the frame to black (1) or back (0). */
  fade(to: number, seconds: number): Promise<void> {
    return fadeOpacity(this.fader, to, seconds);
  }

  /** A camera flash: the whole frame white, falling off over half a second. */
  flash(): Promise<void> {
    this.flashLayer.style.opacity = '1';
    return fadeOpacity(this.flashLayer, 0, 0.55);
  }

  /** The reporter's next step, kept in the top-right corner while the player walks. Null hides it. */
  showGoal(text: string | null): void {
    if (this.goal.textContent !== (text ?? '')) this.goal.textContent = text ?? '';
    this.goal.hidden = text === null;
  }

  /** Shows a short line in the corner, such as "Got: Brass key". */
  notify(text: string, seconds = 3): void {
    this.notice.textContent = text;
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    void fadeOpacity(this.notice, 1, 0.3);
    this.noticeTimer = setTimeout(() => void fadeOpacity(this.notice, 0, 0.8), seconds * 1000);
  }
}

/**
 * At fractional frame scales the browser draws the pixel font with soft, uneven edges. A filter that
 * rounds every text pixel's alpha to 0 or 1 gives back hard edges, like the nearest-neighbor 3D frame.
 */
function keepTextCrisp(root: HTMLElement): void {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ui-filters');
  svg.innerHTML =
    '<filter id="ui-crisp" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter>';
  root.appendChild(svg);
  const apply = () => {
    const { scale } = fitFrame(window.innerWidth, window.innerHeight);
    root.classList.toggle('ui-crisp', scale !== Math.round(scale));
  };
  apply();
  window.addEventListener('resize', apply);
}
