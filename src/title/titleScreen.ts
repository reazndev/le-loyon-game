import { el } from '../engine/ui/dom';
import { ListMenu } from '../engine/ui/listMenu';
import { FogPainter, TITLE_HEIGHT, TITLE_WIDTH } from './fogPainter';
import './title.css';

const TITLE = 'Le Loyon';
/** A plain serif, as on a late-90s box or a film's opening card. */
const TITLE_FONT = "36px 'Times New Roman', 'Liberation Serif', 'Nimbus Roman', 'DejaVu Serif', serif";

/** The title screen picture and its menu. Animates on its own clock until `stop`. */
export class TitleScreen {
  readonly element: HTMLElement;
  readonly menu: ListMenu;
  private readonly canvas: HTMLCanvasElement;
  private readonly painter: FogPainter;
  private readonly title: HTMLCanvasElement;
  private frame = 0;
  private last = 0;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'title-screen';
    this.canvas = el('canvas', 'title-picture', this.element);
    this.canvas.width = TITLE_WIDTH;
    this.canvas.height = TITLE_HEIGHT;
    this.painter = new FogPainter(this.canvas.getContext('2d')!);
    this.title = drawTitle();
    this.menu = new ListMenu(el('div', 'title-menu', this.element));
    this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
  }

  private readonly tick = (now: number) => {
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.1) : 0;
    this.last = now;
    this.painter.paint(dt);
    const context = this.canvas.getContext('2d')!;
    // The title breathes very slightly, like a lamp on an unsteady supply.
    context.globalAlpha = 0.9 + Math.sin(now / 1700) * 0.05 + (Math.random() < 0.02 ? -0.25 : 0);
    context.drawImage(this.title, 0, 0);
    context.globalAlpha = 1;
    this.frame = requestAnimationFrame(this.tick);
  };
}

function drawTitle(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TITLE_WIDTH;
  canvas.height = TITLE_HEIGHT;
  const context = canvas.getContext('2d')!;
  context.font = TITLE_FONT;
  context.letterSpacing = '3px';
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.fillStyle = '#d2cbbb';
  context.fillText(TITLE, TITLE_WIDTH / 2, 96);
  return canvas;
}
