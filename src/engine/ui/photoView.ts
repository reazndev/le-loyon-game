import { el, setVisible } from './dom';
import { grainTexture } from './grain';

/** An instant photo held up to the screen: the picture in a white card with a caption strip. */
export class PhotoView {
  private readonly screen: HTMLElement;
  private readonly image: HTMLImageElement;
  private readonly unexposed: HTMLElement;
  private readonly caption: HTMLElement;

  constructor(parent: HTMLElement) {
    this.screen = el('div', 'ui-photo', parent);
    const card = el('div', 'ui-polaroid', this.screen);
    card.style.backgroundImage = `url(${grainTexture(214, 210, 198)})`;
    const window = el('div', 'ui-polaroid-image', card);
    this.image = el('img', '', window);
    this.unexposed = el('div', 'ui-polaroid-unexposed', window);
    this.caption = el('div', 'ui-polaroid-caption', card);
    this.close();
  }

  /** `developed` runs from 0, a gray blank fresh out of the camera, to 1, the finished picture. */
  show(image: string, caption: string | undefined, developed = 1): void {
    this.image.src = image;
    this.caption.textContent = caption ?? '';
    this.develop(developed);
    setVisible(this.screen, true);
  }

  develop(amount: number): void {
    // Instant film comes out gray-green and the image surfaces from it, darks first.
    this.unexposed.style.opacity = String(1 - Math.min(1, Math.max(0, amount)) ** 0.7);
    this.caption.style.opacity = amount >= 1 ? '1' : '0';
  }

  close(): void {
    setVisible(this.screen, false);
  }
}
