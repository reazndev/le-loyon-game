import type { Shape, Vec2 } from '../physics/collision';
import { el } from './dom';

/** What the map and compass show this frame. */
export interface NavigationView {
  player: Vec2;
  /** Radians; 0 looks down -Z, positive turns left. */
  yaw: number;
  /** Degrees to turn to face the target; positive is to the right. Null when there is none. */
  bearing: number | null;
  target: Vec2 | null;
  walls: Iterable<Shape>;
  exits: Vec2[];
  keys: { compass: string; map: string };
}

type Held = 'compass' | 'map' | null;

const SMALL = { size: 96, range: 22 };
const LARGE = { size: 300, range: 45 };

/**
 * The minimap in the bottom-right corner with the compass resting on its top edge. Either can be
 * taken in hand: it rises from the bottom of the frame, large, and stays while the player walks.
 */
export class NavigationHud {
  held: Held = null;
  private readonly root: HTMLElement;
  private readonly map: HTMLCanvasElement;
  private readonly compass: HTMLElement;
  private readonly needle: HTMLElement;
  private readonly mapKey: HTMLElement;
  private readonly compassKey: HTMLElement;

  constructor(parent: HTMLElement) {
    this.root = el('div', 'ui-nav', parent);
    const mapCard = el('div', 'ui-nav-map', this.root);
    this.map = el('canvas', 'ui-nav-canvas', mapCard);
    this.mapKey = el('span', 'ui-key ui-nav-key', mapCard);
    this.compass = el('div', 'ui-nav-compass', this.root);
    const dial = el('div', 'ui-compass-dial', this.compass);
    dial.style.backgroundImage = 'url(assets/textures/compass_body.png)';
    this.needle = el('div', 'ui-compass-needle', dial);
    this.needle.style.backgroundImage = 'url(assets/textures/compass_needle.png)';
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
    this.draw(view, this.held === 'map' ? LARGE : SMALL);
  }

  /** Draws the walls around the player, heading up, with the ways out and the target. */
  private draw(view: NavigationView, { size, range }: { size: number; range: number }): void {
    if (this.map.width !== size) this.map.width = this.map.height = size;
    const g = this.map.getContext('2d')!;
    const scale = size / 2 / range;
    const forward = { x: -Math.sin(view.yaw), z: -Math.cos(view.yaw) };
    const right = { x: Math.cos(view.yaw), z: -Math.sin(view.yaw) };
    const toMap = (x: number, z: number): [number, number] => {
      const dx = x - view.player.x;
      const dz = z - view.player.z;
      return [size / 2 + (dx * right.x + dz * right.z) * scale, size / 2 - (dx * forward.x + dz * forward.z) * scale];
    };
    const near = (p: Vec2, extra = 0) => Math.abs(p.x - view.player.x) < range * 1.5 + extra && Math.abs(p.z - view.player.z) < range * 1.5 + extra;

    g.fillStyle = this.held === 'map' ? '#cdbf98' : 'rgba(12, 12, 10, 0.7)';
    g.fillRect(0, 0, size, size);
    g.fillStyle = this.held === 'map' ? '#5a4a30' : 'rgba(190, 182, 160, 0.75)';
    for (const shape of view.walls) {
      if (!near(shape, shape.kind === 'box' ? Math.max(shape.hw, shape.hd) : shape.r)) continue;
      g.beginPath();
      if (shape.kind === 'circle') {
        const [x, y] = toMap(shape.x, shape.z);
        g.arc(x, y, Math.max(1, shape.r * scale), 0, Math.PI * 2);
      } else {
        const c = Math.cos(shape.angle);
        const s = Math.sin(shape.angle);
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v], i) => {
          const lx = u! * shape.hw;
          const lz = v! * shape.hd;
          const [x, y] = toMap(shape.x + c * lx + s * lz, shape.z - s * lx + c * lz);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        });
        g.closePath();
      }
      g.fill();
    }
    g.fillStyle = '#d8b040';
    view.exits.forEach((exit) => {
      const [x, y] = toMap(exit.x, exit.z);
      g.fillRect(x - 2, y - 2, 4, 4);
    });
    if (view.target) {
      const [tx, ty] = toMap(view.target.x, view.target.z);
      const edge = size / 2 - 4;
      const k = Math.min(1, edge / Math.max(Math.abs(tx - size / 2), Math.abs(ty - size / 2), 1));
      g.fillStyle = '#c0392b';
      g.beginPath();
      g.arc(size / 2 + (tx - size / 2) * k, size / 2 + (ty - size / 2) * k, 3.5, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#f2ede0';
    g.beginPath();
    g.moveTo(size / 2, size / 2 - 6);
    g.lineTo(size / 2 + 4, size / 2 + 4);
    g.lineTo(size / 2 - 4, size / 2 + 4);
    g.closePath();
    g.fill();
  }
}
