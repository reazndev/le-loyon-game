import { context2d, gridCanvas, canvas } from '../gfx/pixels';
import { cursorArrow, cursorHand, cursorHourglass } from '../gfx/icons';

export type CursorShape = 'arrow' | 'hand' | 'busy';

const shapes: Record<CursorShape, { image: () => HTMLCanvasElement; hotX: number; hotY: number }> = {
  arrow: { image: () => gridCanvas(cursorArrow), hotX: 0, hotY: 0 },
  hand: { image: () => gridCanvas(cursorHand), hotX: 5, hotY: 0 },
  busy: { image: busyArrow, hotX: 0, hotY: 0 },
};

function busyArrow(): HTMLCanvasElement {
  const element = canvas(24, 24);
  const context = context2d(element);
  context.drawImage(gridCanvas(cursorArrow), 0, 0);
  context.drawImage(gridCanvas(cursorHourglass), 12, 10);
  return element;
}

/** The mouse pointer, in 640x480 screen pixels. */
export class Cursor {
  readonly element = canvas(24, 24, 'px pc-cursor');
  x = 320;
  y = 240;
  private shape: CursorShape | null = null;
  private readonly images = new Map<CursorShape, HTMLCanvasElement>();

  moveTo(x: number, y: number): void {
    this.x = Math.min(Math.max(x, 0), 639);
    this.y = Math.min(Math.max(y, 0), 479);
  }

  render(shape: CursorShape): void {
    if (shape !== this.shape) {
      this.shape = shape;
      const context = context2d(this.element);
      context.clearRect(0, 0, 24, 24);
      context.drawImage(this.image(shape), 0, 0);
    }
    const { hotX, hotY } = shapes[shape];
    this.element.style.transform = `translate(${Math.round(this.x) - hotX}px, ${Math.round(this.y) - hotY}px)`;
  }

  private image(shape: CursorShape): HTMLCanvasElement {
    let image = this.images.get(shape);
    if (!image) {
      image = shapes[shape].image();
      this.images.set(shape, image);
    }
    return image;
  }
}
