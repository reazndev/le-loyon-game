import type { Vec2 } from './physics/collision';

export interface Interactable {
  /** World position of the object's center in the XZ plane. */
  position: Vec2;
  /** Size of the object. The player can use it from `radius + REACH` meters away. */
  radius: number;
  /** Text after the button hint, such as "Open the door". */
  prompt: string | (() => string);
  /** When this returns false, the object is ignored. */
  enabled?: () => boolean;
  onInteract: () => void | Promise<void>;
  /** What the camera makes of the object: a `photo_*` item id or a misc photo caption key. */
  photo?: string;
}

/** How far past an object's radius the player can reach, in meters. */
export const REACH = 1.1;
/** How far off-center, in degrees, the player can look and still target an object. */
export const FACING_CONE_DEG = 40;

/** Picks the object the player is facing, preferring close and centered ones. */
export function findFocus(items: Iterable<Interactable>, from: Vec2, facing: Vec2): Interactable | null {
  const cosCone = Math.cos((FACING_CONE_DEG * Math.PI) / 180);
  let best: Interactable | null = null;
  let bestScore = Infinity;
  for (const item of items) {
    if (item.enabled && !item.enabled()) continue;
    const dx = item.position.x - from.x;
    const dz = item.position.z - from.z;
    const dist = Math.hypot(dx, dz);
    const gap = dist - item.radius;
    if (gap > REACH) continue;
    // Standing inside or touching an object counts as facing it.
    const alignment = dist < 1e-6 ? 1 : (dx * facing.x + dz * facing.z) / dist;
    if (gap > 0 && alignment < cosCone) continue;
    const score = Math.max(gap, 0) + (1 - alignment) * 2;
    if (score < bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}

export class Interactions {
  private readonly items = new Set<Interactable>();

  add(item: Interactable): () => void {
    this.items.add(item);
    return () => this.items.delete(item);
  }

  clear(): void {
    this.items.clear();
  }

  focus(from: Vec2, facing: Vec2): Interactable | null {
    return findFocus(this.items, from, facing);
  }
}

export function promptText(item: Interactable): string {
  return typeof item.prompt === 'function' ? item.prompt() : item.prompt;
}
