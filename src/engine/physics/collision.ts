/**
 * 2D collision in the XZ plane. The player is a circle; the world is boxes and circles.
 * Moves are split into small steps and pushed out of each shape, which makes the player slide
 * along walls instead of stopping dead.
 */

export interface Vec2 {
  x: number;
  z: number;
}

export interface CircleShape {
  kind: 'circle';
  x: number;
  z: number;
  r: number;
}

/** A box of half width `hw` (local X) and half depth `hd` (local Z), turned by `angle` radians around Y. */
export interface BoxShape {
  kind: 'box';
  x: number;
  z: number;
  hw: number;
  hd: number;
  angle: number;
}

export type Shape = CircleShape | BoxShape;

/** Turns a world offset into a box's local frame. Matches Three.js rotation around Y. */
function toLocal(box: BoxShape, x: number, z: number): Vec2 {
  const dx = x - box.x;
  const dz = z - box.z;
  const c = Math.cos(box.angle);
  const s = Math.sin(box.angle);
  return { x: c * dx - s * dz, z: s * dx + c * dz };
}

function toWorldDirection(box: BoxShape, v: Vec2): Vec2 {
  const c = Math.cos(box.angle);
  const s = Math.sin(box.angle);
  return { x: c * v.x + s * v.z, z: -s * v.x + c * v.z };
}

export function containsPoint(shape: Shape, x: number, z: number): boolean {
  if (shape.kind === 'circle') return (x - shape.x) ** 2 + (z - shape.z) ** 2 <= shape.r ** 2;
  const local = toLocal(shape, x, z);
  return Math.abs(local.x) <= shape.hw && Math.abs(local.z) <= shape.hd;
}

/** The offset that moves a circle at (x, z) with radius `r` out of `shape`, or null if they don't touch. */
export function pushOut(shape: Shape, x: number, z: number, r: number): Vec2 | null {
  if (shape.kind === 'circle') {
    const dx = x - shape.x;
    const dz = z - shape.z;
    const dist = Math.hypot(dx, dz);
    const overlap = shape.r + r - dist;
    if (overlap <= 0) return null;
    if (dist < 1e-9) return { x: overlap, z: 0 };
    return { x: (dx / dist) * overlap, z: (dz / dist) * overlap };
  }

  const local = toLocal(shape, x, z);
  const inside = Math.abs(local.x) < shape.hw && Math.abs(local.z) < shape.hd;
  if (inside) {
    // Leave through the nearest side.
    const exitX = shape.hw - Math.abs(local.x) + r;
    const exitZ = shape.hd - Math.abs(local.z) + r;
    const push = exitX < exitZ ? { x: Math.sign(local.x || 1) * exitX, z: 0 } : { x: 0, z: Math.sign(local.z || 1) * exitZ };
    return toWorldDirection(shape, push);
  }
  const closestX = Math.max(-shape.hw, Math.min(shape.hw, local.x));
  const closestZ = Math.max(-shape.hd, Math.min(shape.hd, local.z));
  const dx = local.x - closestX;
  const dz = local.z - closestZ;
  const dist = Math.hypot(dx, dz);
  if (dist >= r) return null;
  return toWorldDirection(shape, { x: (dx / dist) * (r - dist), z: (dz / dist) * (r - dist) });
}

export class CollisionWorld {
  private readonly shapes = new Set<Shape>();

  add(shape: Shape): () => void {
    this.shapes.add(shape);
    return () => this.shapes.delete(shape);
  }

  clear(): void {
    this.shapes.clear();
  }

  /** Moves a circle by `delta` and returns where it ends up after sliding along obstacles. */
  move(from: Vec2, delta: Vec2, radius: number): Vec2 {
    const length = Math.hypot(delta.x, delta.z);
    const steps = Math.max(1, Math.ceil(length / (radius * 0.5)));
    let x = from.x;
    let z = from.z;
    for (let step = 0; step < steps; step++) {
      x += delta.x / steps;
      z += delta.z / steps;
      ({ x, z } = this.resolve(x, z, radius));
    }
    return { x, z };
  }

  /** Pushes a circle out of every overlapping shape. A few passes settle corners. */
  resolve(x: number, z: number, radius: number): Vec2 {
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (const shape of this.shapes) {
        const push = pushOut(shape, x, z, radius);
        if (!push) continue;
        x += push.x;
        z += push.z;
        moved = true;
      }
      if (!moved) break;
    }
    return { x, z };
  }
}
