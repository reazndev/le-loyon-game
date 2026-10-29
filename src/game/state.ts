import { Emitter } from '../engine/events';
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
  time: TimeOfDay;
}

/** Everything that a save file records. */
export interface StateSnapshot {
  scene: string;
  time: TimeOfDay;
  flags: string[];
  inventory: string[];
  player: PlayerPose;
}

/** Flags, inventory, current scene, and time of day. Inventory holds each item once, in pickup order. */
export class GameState implements StateMutator {
  readonly events = new Emitter<StateEvents>();
  scene = '';
  player: PlayerPose = { x: 0, y: 0, z: 0, yaw: 0 };
  private readonly flags = new Set<string>();
  private readonly items: string[] = [];
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

  snapshot(): StateSnapshot {
    return {
      scene: this.scene,
      time: this.timeOfDay,
      flags: [...this.flags].sort(),
      inventory: [...this.items],
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
    this.items.splice(0, this.items.length, ...snapshot.inventory);
  }
}
