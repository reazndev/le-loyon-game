import './ui.css';
import { fitFrame } from '../render/frame';
import { DialogueBox } from './dialogueBox';
import { DocumentView } from './documentView';
import { el, fadeOpacity } from './dom';
import { MenuScreen } from './menuScreen';
import { NavigationHud } from './navigationHud';
import { PhotoView } from './photoView';
import { Prompt } from './prompt';

/** Something brushing the reporter's face: a branch sweeping past, or a cobweb walked into. */
export type BrushKind = 'branch' | 'web';

/** The brush layers draw at a quarter of the frame, so their edges come out in chunky pixels. */
const BRUSH_W = 160;
const BRUSH_H = 120;

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
  private readonly eyelids: HTMLElement;
  private readonly brushLayer: HTMLCanvasElement;
  private readonly fader: HTMLElement;
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(frame: HTMLElement) {
    this.root = el('div', 'ui', frame);
    // Under the eyelids, so shut eyes hide what brushes the face too.
    this.brushLayer = el('canvas', 'ui-brush', this.root);
    this.brushLayer.width = BRUSH_W;
    this.brushLayer.height = BRUSH_H;
    // First, so a blink darkens the world but not the HUD over it.
    this.eyelids = el('div', 'ui-eyelids', this.root);
    el('div', 'ui-eyelid top', this.eyelids);
    el('div', 'ui-eyelid bottom', this.eyelids);
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
    setTimeout(() => this.blink(), 350);
  }

  /**
   * The reporter's eyes closing and opening again, in under a fifth of a second. With `hold`,
   * a slow blink instead: the lids come down, stay shut `hold` seconds, and lift again.
   */
  blink(hold = 0): void {
    if (hold > 0) {
      this.eyelids.classList.add('shut');
      setTimeout(() => this.eyelids.classList.remove('shut'), hold * 1000 + 350);
      return;
    }
    this.eyelids.classList.remove('blinking');
    void this.eyelids.offsetWidth;
    this.eyelids.classList.add('blinking');
  }

  /**
   * Something touching the reporter's face. A branch is a dark twig and leaves sweeping across
   * one side of the frame, with a small knock; a web is pale threads over the eyes, fading over
   * two seconds. The sound is the caller's.
   */
  brush(kind: BrushKind): void {
    const canvas = this.brushLayer;
    const g = canvas.getContext('2d')!;
    g.clearRect(0, 0, BRUSH_W, BRUSH_H);
    const from = Math.random() < 0.5 ? -1 : 1;
    if (kind === 'branch') drawBranch(g, from);
    else drawWeb(g);
    canvas.style.setProperty('--from', String(from));
    canvas.classList.remove('branch', 'web');
    void canvas.offsetWidth;
    canvas.classList.add(kind);
    if (kind === 'branch') this.nudge();
  }

  /** A small knock to the frame, much lighter than a jolt. */
  private nudge(): void {
    const frame = this.root.parentElement!;
    frame.classList.remove('ui-nudge');
    void frame.offsetWidth;
    frame.classList.add('ui-nudge');
    setTimeout(() => frame.classList.remove('ui-nudge'), 200);
  }

  /** Shows a short line in the corner, such as "Got: Brass key". */
  notify(text: string, seconds = 3): void {
    this.notice.textContent = text;
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    void fadeOpacity(this.notice, 1, 0.3);
    this.noticeTimer = setTimeout(() => void fadeOpacity(this.notice, 0, 0.8), seconds * 1000);
  }
}

/** A dark twig with a few leaves, reaching in from the left (`from` -1) or right edge. */
function drawBranch(g: CanvasRenderingContext2D, from: number): void {
  const x0 = from < 0 ? 0 : BRUSH_W;
  const y0 = BRUSH_H * (0.15 + Math.random() * 0.5);
  const reach = BRUSH_W * (0.45 + Math.random() * 0.2);
  const x1 = x0 - from * reach;
  const y1 = y0 + (Math.random() - 0.3) * 40;
  g.strokeStyle = g.fillStyle = '#050504';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.stroke();
  g.lineWidth = 1.5;
  Array.from({ length: 6 }).forEach((_, i) => {
    const k = (i + 1) / 7;
    const x = x0 + (x1 - x0) * k;
    const y = y0 + (y1 - y0) * k;
    const side = i % 2 === 0 ? -1 : 1;
    const tipX = x - from * (6 + Math.random() * 6);
    const tipY = y + side * (8 + Math.random() * 10);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(tipX, tipY);
    g.stroke();
    g.beginPath();
    g.ellipse(tipX, tipY, 6, 3, Math.atan2(tipY - y, tipX - x), 0, Math.PI * 2);
    g.fill();
  });
}

/** A few pale threads from one spot near the middle, with rough rings between them. */
function drawWeb(g: CanvasRenderingContext2D): void {
  const cx = BRUSH_W * (0.3 + Math.random() * 0.4);
  const cy = BRUSH_H * (0.3 + Math.random() * 0.4);
  const spokes = Array.from({ length: 9 }, (_, i) => ((i + Math.random() * 0.5) / 9) * Math.PI * 2);
  const reach = BRUSH_W * 0.7;
  g.strokeStyle = 'rgba(220, 222, 214, 0.5)';
  g.lineWidth = 1;
  spokes.forEach((angle) => {
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
    g.stroke();
  });
  g.strokeStyle = 'rgba(220, 222, 214, 0.3)';
  [10, 19, 30, 44, 60].forEach((r) => {
    g.beginPath();
    spokes.forEach((angle, i) => {
      const sag = r * (0.85 + Math.random() * 0.15);
      const x = cx + Math.cos(angle) * sag;
      const y = cy + Math.sin(angle) * sag;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.closePath();
    g.stroke();
  });
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
