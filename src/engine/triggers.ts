import { containsPoint, type Shape, type Vec2 } from './physics/collision';

export interface TriggerZone {
  area: Shape;
  onEnter?: () => void;
  onExit?: () => void;
  /** Removes the zone after its first enter. */
  once?: boolean;
}

/** Calls zone handlers when the player walks in or out of an area. */
export class Triggers {
  private readonly zones = new Map<TriggerZone, boolean>();

  add(zone: TriggerZone): () => void {
    this.zones.set(zone, false);
    return () => this.zones.delete(zone);
  }

  clear(): void {
    this.zones.clear();
  }

  /** Marks zones the player already stands in as entered, so spawning inside one doesn't fire it. */
  settle(at: Vec2): void {
    this.zones.forEach((_, zone) => this.zones.set(zone, containsPoint(zone.area, at.x, at.z)));
  }

  update(at: Vec2): void {
    for (const [zone, wasInside] of [...this.zones]) {
      const inside = containsPoint(zone.area, at.x, at.z);
      if (inside === wasInside) continue;
      this.zones.set(zone, inside);
      if (inside) {
        if (zone.once) this.zones.delete(zone);
        zone.onEnter?.();
      } else {
        zone.onExit?.();
      }
    }
  }
}
