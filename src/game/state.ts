import { Emitter } from '../engine/events';
import type { Photo } from './camera/photos';
import type { StateMutator } from './conditions';

export type TimeOfDay = 'day' | 'night';

export interface PlayerPose {
  x: number;
  y: number;
  z: number;
  /** Degrees. 0 looks down -Z, 90 looks down -X. */
  yaw: number;
}

export interface StateEvents extends Record<string, unknown> {
  flag: { flag: string; on: boolean };
  item: { item: string; held: boolean };
  count: { name: string; value: number };
  time: TimeOfDay;
}

/** Everything that a save file records. */
export interface StateSnapshot {
  scene: string;
  time: TimeOfDay;
  flags: string[];
  inventory: string[];
  /** Missing in saves made before counts existed. */
  counts?: Record<string, number>;
  /** Polaroids by item id. Missing in saves made before the camera existed. */
  photos?: Record<string, Photo>;
  /** The map squares walked near, by scene. Missing in saves made before the map fog. */
  explored?: Record<string, string[]>;
  player: PlayerPose;
}

/** Meters per side of a square of ground the map remembers. */
const EXPLORE_CELL = 3;
/** How far around the reporter the map fills in: about as far as the fog lets them see. */
const EXPLORE_RADIUS = 10;
const cellKey = (i: number, j: number) => `${i},${j}`;

/** Flags, counts, inventory, photos, current scene, and time of day. Inventory holds each item once, in pickup order. */
export class GameState implements StateMutator {
  readonly events = new Emitter<StateEvents>();
  scene = '';
  player: PlayerPose = { x: 0, y: 0, z: 0, yaw: 0 };
  private readonly flags = new Set<string>();
  private readonly counts = new Map<string, number>();
  private readonly items: string[] = [];
  private readonly pictures = new Map<string, Photo>();
  private readonly explored = new Map<string, Set<string>>();
  private exploredFrom = '';
  private timeOfDay: TimeOfDay = 'day';

  get time(): TimeOfDay {
    return this.timeOfDay;
  }

  set time(value: TimeOfDay) {
    if (value === this.timeOfDay) return;
    this.timeOfDay = value;
    this.events.emit('time', value);
  }

  get inventory(): readonly string[] {
    return this.items;
  }

  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  setFlag(flag: string, on = true): void {
    if (this.flags.has(flag) === on) return;
    if (on) this.flags.add(flag);
    else this.flags.delete(flag);
    this.events.emit('flag', { flag, on });
  }

  count(name: string): number {
    return this.counts.get(name) ?? 0;
  }

  setCount(name: string, value: number): void {
    if (this.count(name) === value) return;
    this.counts.set(name, value);
    this.events.emit('count', { name, value });
  }

  hasItem(item: string): boolean {
    return this.items.includes(item);
  }

  giveItem(item: string): void {
    if (this.hasItem(item)) return;
    this.items.push(item);
    this.events.emit('item', { item, held: true });
  }

  takeItem(item: string): void {
    const index = this.items.indexOf(item);
    if (index < 0) return;
    this.items.splice(index, 1);
    this.events.emit('item', { item, held: false });
  }

  /** The picture behind a camera photo item. */
  photo(item: string): Photo | undefined {
    return this.pictures.get(item);
  }

  /** Ids of every photo taken, in the order taken. */
  get photos(): string[] {
    return [...this.pictures.keys()];
  }

  addPhoto(item: string, photo: Photo): void {
    this.pictures.set(item, photo);
  }

  /** Marks the ground around a point in the current scene as seen, for the map. */
  explore(x: number, z: number): void {
    const ci = Math.floor(x / EXPLORE_CELL);
    const cj = Math.floor(z / EXPLORE_CELL);
    const from = `${this.scene}:${cellKey(ci, cj)}`;
    if (from === this.exploredFrom) return;
    this.exploredFrom = from;
    const cells = this.explored.get(this.scene) ?? new Set<string>();
    this.explored.set(this.scene, cells);
    const reach = Math.ceil(EXPLORE_RADIUS / EXPLORE_CELL);
    for (let i = ci - reach; i <= ci + reach; i++) {
      for (let j = cj - reach; j <= cj + reach; j++) {
        if (Math.hypot(i - ci, j - cj) * EXPLORE_CELL <= EXPLORE_RADIUS) cells.add(cellKey(i, j));
      }
    }
  }

  /** Whether the reporter has been near a point in the current scene. */
  isExplored(x: number, z: number): boolean {
    return this.explored.get(this.scene)?.has(cellKey(Math.floor(x / EXPLORE_CELL), Math.floor(z / EXPLORE_CELL))) ?? false;
  }

  snapshot(): StateSnapshot {
    return {
      scene: this.scene,
      time: this.timeOfDay,
      flags: [...this.flags].sort(),
      inventory: [...this.items],
      counts: Object.fromEntries(this.counts),
      photos: Object.fromEntries(this.pictures),
      explored: Object.fromEntries([...this.explored].map(([scene, cells]) => [scene, [...cells]])),
      player: { ...this.player },
    };
  }

  /** Replaces all state with a snapshot. Emits no events; callers reload the scene after. */
  restore(snapshot: StateSnapshot): void {
    this.scene = snapshot.scene;
    this.timeOfDay = snapshot.time;
    this.player = { ...snapshot.player };
    this.flags.clear();
    snapshot.flags.forEach((f) => this.flags.add(f));
    this.counts.clear();
    Object.entries(snapshot.counts ?? {}).forEach(([name, value]) => this.counts.set(name, value));
    this.items.splice(0, this.items.length, ...snapshot.inventory);
    this.pictures.clear();
    Object.entries(snapshot.photos ?? {}).forEach(([item, photo]) => this.pictures.set(item, photo));
    this.explored.clear();
    this.exploredFrom = '';
    Object.entries(snapshot.explored ?? {}).forEach(([scene, cells]) => this.explored.set(scene, new Set(cells)));
  }
}
