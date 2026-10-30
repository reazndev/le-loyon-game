import './ui.css';
import { fitFrame } from '../render/frame';
import { DialogueBox } from './dialogueBox';
import { DocumentView } from './documentView';
import { el, fadeOpacity } from './dom';
import { MenuScreen } from './menuScreen';
import { NavigationHud } from './navigationHud';
import { PhotoView } from './photoView';
import { Prompt } from './prompt';

export interface HudButton {
  key: string;
  label: string;
  run: () => void;
}

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
  private readonly goalText: HTMLElement;
  private readonly goalClue: HTMLElement;
  private readonly hud: HTMLElement;
  readonly navigation: NavigationHud;
  private hudShown = '';
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
    this.goalText = el('div', 'ui-goal-step', this.goal);
    this.goalClue = el('div', 'ui-goal-clue', this.goal);
    this.hud = el('div', 'ui-hud', this.root);
    this.navigation = new NavigationHud(this.root);
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

  /**
   * The reporter's next step, kept in the top-right corner while the player walks, with a clue
   * for where they are under it. Null hides it.
   */
  showGoal(text: string | null, clue: string | null = null): void {
    if (this.goalText.textContent !== (text ?? '')) this.goalText.textContent = text ?? '';
    if (this.goalClue.textContent !== (clue ?? '')) this.goalClue.textContent = clue ?? '';
    this.goalClue.hidden = clue === null;
    this.goal.hidden = text === null && clue === null;
  }

  /** Buttons in the top-left corner, each with its key, that work with a click too. Null hides them. */
  showHud(buttons: HudButton[] | null): void {
    const shown = buttons?.map((button) => `${button.key} ${button.label}`).join('|') ?? '';
    if (shown === this.hudShown) return;
    this.hudShown = shown;
    this.hud.replaceChildren();
    buttons?.forEach((button) => {
      const item = el('div', 'ui-hud-button', this.hud);
      el('span', 'ui-key', item).textContent = button.key;
      item.append(button.label);
      item.addEventListener('click', button.run);
    });
  }

  /** A camera flash and half a second of the whole frame shaking. */
  jolt(): void {
    void this.flash();
    const frame = this.root.parentElement!;
    frame.classList.remove('ui-jolt');
    void frame.offsetWidth;
    frame.classList.add('ui-jolt');
    setTimeout(() => frame.classList.remove('ui-jolt'), 500);
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
