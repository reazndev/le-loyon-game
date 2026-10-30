import type { Shape, Vec2 } from '../physics/collision';
import type { Surface } from '../physics/ground';
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
  /** What the ground is at a point, so paths and floors show. */
  ground: (x: number, z: number) => Surface;
  exits: Vec2[];
  keys: { compass: string; map: string };
}

type Held = 'compass' | 'map' | null;

/** Map pixels across, and meters from the player to the edge. Drawn small and shown enlarged, so the pixels stay chunky. */
const SMALL = { size: 48, range: 22, round: true };
const LARGE = { size: 120, range: 45, round: false };

/** Old paper, greyed by the fog, and ink. Paths and floors are shaded into the paper. */
const PAPER: Record<Surface, string> = { grass: '#8a8166', snow: '#8a8166', gravel: '#a59a7b', stone: '#a1987c', wood: '#77694d' };
const STAIN = '#6c6450';
const INK = '#2b241a';
const RED_INK = '#7e2016';
/** Seconds between redraws: the map is a sketch, not a live feed. */
const REDRAW = 0.1;

/** The same grain every frame, from the pixel's place on the sheet. */
const grain = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

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
    const now = performance.now() / 1000;
    if (now - this.drawnAt < REDRAW && this.drawnHeld === this.held) return;
    this.drawnAt = now;
    this.drawnHeld = this.held;
    this.draw(view, this.held === 'map' ? LARGE : SMALL);
  }

  /** Draws the walls around the player in ink on old paper, heading up, with the ways out and the target. */
  private draw(view: NavigationView, { size, range, round }: { size: number; range: number; round: boolean }): void {
    if (this.map.width !== size) this.map.width = this.map.height = size;
    const g = this.map.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, size, size);
    const mid = size / 2;
    const scale = mid / range;
    const forward = { x: -Math.sin(view.yaw), z: -Math.cos(view.yaw) };
    const right = { x: Math.cos(view.yaw), z: -Math.sin(view.yaw) };
    const toMap = (x: number, z: number): [number, number] => {
      const dx = x - view.player.x;
      const dz = z - view.player.z;
      return [mid + (dx * right.x + dz * right.z) * scale, mid - (dx * forward.x + dz * forward.z) * scale];
    };
    const toWorld = (px: number, py: number): Vec2 => {
      const across = (px + 0.5 - mid) / scale;
      const ahead = (mid - py - 0.5) / scale;
      return { x: view.player.x + across * right.x + ahead * forward.x, z: view.player.z + across * right.z + ahead * forward.z };
    };
    const near = (p: Vec2, extra = 0) => Math.abs(p.x - view.player.x) < range * 1.5 + extra && Math.abs(p.z - view.player.z) < range * 1.5 + extra;
    // A round scrap in the corner; a sheet with torn edges and two folds in hand.
    const fromEdge = (x: number, y: number) =>
      round ? mid - 0.5 - Math.hypot(x + 0.5 - mid, y + 0.5 - mid) : Math.min(x, y, size - 1 - x, size - 1 - y) - (grain(x, y) % 3);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const edge = fromEdge(x, y);
        if (edge < 0) continue;
        const at = toWorld(x, y);
        // Stains creep in from the edge, and a few specks of dirt sit on the sheet.
        const stained = edge < 2 + (grain(x, y) % 3) || grain(x, y) % 37 === 0;
        g.fillStyle = stained ? STAIN : PAPER[view.ground(at.x, at.z)];
        g.fillRect(x, y, 1, 1);
      }
    }
    g.save();
    g.beginPath();
    if (round) g.arc(mid, mid, mid - 1.5, 0, Math.PI * 2);
    else g.rect(2, 2, size - 4, size - 4);
    g.clip();

    g.fillStyle = INK;
    for (const shape of view.walls) {
      if (!near(shape, shape.kind === 'box' ? Math.max(shape.hw, shape.hd) : shape.r)) continue;
      if (shape.kind === 'circle') {
        const [x, y] = toMap(shape.x, shape.z);
        const r = Math.max(0.5, shape.r * scale);
        g.fillRect(Math.round(x - r), Math.round(y - r), Math.max(1, Math.round(r * 2)), Math.max(1, Math.round(r * 2)));
        continue;
      }
      const c = Math.cos(shape.angle);
      const s = Math.sin(shape.angle);
      g.beginPath();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v], i) => {
        const lx = u! * shape.hw;
        const lz = v! * shape.hd;
        const [x, y] = toMap(shape.x + c * lx + s * lz, shape.z - s * lx + c * lz);
        if (i === 0) g.moveTo(Math.round(x), Math.round(y));
        else g.lineTo(Math.round(x), Math.round(y));
      });
      g.closePath();
      g.fill();
    }
    // Ways out: a small open ring in red ink.
    g.strokeStyle = RED_INK;
    g.lineWidth = 1;
    view.exits.forEach((exit) => {
      const [x, y] = toMap(exit.x, exit.z);
      g.strokeRect(Math.round(x) - 1.5, Math.round(y) - 1.5, 3, 3);
    });
    g.restore();

    // The target: a red X, held to the edge of the sheet when it is further away.
    if (view.target) {
      const [tx, ty] = toMap(view.target.x, view.target.z);
      const edge = mid - 5;
      const k = Math.min(1, edge / Math.max(Math.hypot(tx - mid, ty - mid), 1));
      const x = Math.round(mid + (tx - mid) * k);
      const y = Math.round(mid + (ty - mid) * k);
      g.fillStyle = RED_INK;
      [-2, -1, 0, 1, 2].forEach((d) => {
        g.fillRect(x + d, y + d, 1, 1);
        g.fillRect(x + d, y - d, 1, 1);
      });
    }

    // The reporter: a small ink arrowhead, always pointing up.
    g.fillStyle = RED_INK;
    [[0, -3, 1], [-1, -2, 3], [-1, -1, 3], [-2, 0, 5], [-2, 1, 2], [1, 1, 2]].forEach(([dx, dy, w]) =>
      g.fillRect(Math.round(mid) + dx!, Math.round(mid) + dy!, w!, 1),
    );

  }
}
