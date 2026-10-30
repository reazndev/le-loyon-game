import { drawMap, type MapView, type Sheet } from './mapSheet';
import { el } from './dom';

/** What the map and compass show this frame. */
export interface NavigationView extends MapView {
  /** Degrees to turn to face the target; positive is to the right. Null when there is none. */
  bearing: number | null;
  keys: { compass: string; map: string };
}

type Held = 'compass' | 'map' | null;

/** Map pixels across, and meters from the player to the edge. Shown at twice the size, like the compass sprites. */
const SMALL: Sheet = { size: 48, range: 22, round: true };
const LARGE: Sheet = { size: 180, range: 45, round: false };
/** Seconds between redraws: the map is a sketch, not a live feed. */
const REDRAW = 0.1;

/**
 * The minimap in the bottom-right corner with the compass resting on its top edge. Either can be
 * taken in hand: it rises from the bottom of the frame, large, and stays while the player walks.
 */
export class NavigationHud {
  held: Held = null;
  private drawnAt = 0;
  private drawnHeld: Held = null;
  private readonly root: HTMLElement;
  private readonly map: HTMLCanvasElement;
  private readonly compass: HTMLElement;
  private readonly dial: HTMLElement;
  private readonly needle: HTMLElement;
  private readonly mapKey: HTMLElement;
  private readonly compassKey: HTMLElement;

  constructor(parent: HTMLElement) {
    this.root = el('div', 'ui-nav', parent);
    const mapCard = el('div', 'ui-nav-map', this.root);
    this.map = el('canvas', 'ui-nav-canvas', mapCard);
    this.mapKey = el('span', 'ui-key ui-nav-key', mapCard);
    this.compass = el('div', 'ui-nav-compass', this.root);
    this.dial = el('div', 'ui-compass-dial', this.compass);
    this.needle = el('div', 'ui-compass-needle', this.dial);
    this.drawCompass('');
    this.compassKey = el('span', 'ui-key ui-nav-key', this.compass);
    mapCard.addEventListener('click', () => this.toggle('map'));
    this.compass.addEventListener('click', () => this.toggle('compass'));
  }

  /** Takes the map or the compass in hand, or puts it back. */
  toggle(item: 'compass' | 'map'): void {
    this.held = this.held === item ? null : item;
  }

  show(view: NavigationView | null): void {
    this.root.hidden = view === null;
    if (!view) return;
    this.root.dataset.held = this.held ?? '';
    this.compass.classList.toggle('lost', view.bearing === null);
    this.needle.style.transform = `rotate(${Math.round(view.bearing ?? 0)}deg)`;
    this.mapKey.textContent = view.keys.map;
    this.compassKey.textContent = view.keys.compass;
    this.compassKey.hidden = view.keys.compass === '';
    const now = performance.now() / 1000;
    if (now - this.drawnAt < REDRAW && this.drawnHeld === this.held) return;
    this.drawnAt = now;
    if (this.drawnHeld !== this.held) this.drawCompass(this.held === 'compass' ? '_held' : '');
    this.drawnHeld = this.held;
    this.draw(view, this.held === 'map' ? LARGE : SMALL);
  }

  /** In hand the compass is shown four times larger, so it swaps to sprites with more pixels. */
  private drawCompass(variant: '' | '_held'): void {
    this.dial.style.backgroundImage = `url(assets/textures/compass_body${variant}.png)`;
    this.needle.style.backgroundImage = `url(assets/textures/compass_needle${variant}.png)`;
  }

  private draw(view: NavigationView, sheet: Sheet): void {
    if (this.map.width !== sheet.size) this.map.width = this.map.height = sheet.size;
    const g = this.map.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    drawMap(g, view, sheet);
  }
}
