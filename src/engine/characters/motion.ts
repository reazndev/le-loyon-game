import type { Vec2 } from '../physics/collision';

/** A point on a walk, with an optional stop there. */
export interface Waypoint extends Vec2 {
  /** Seconds to stand still on arrival. */
  wait?: number;
}

/** The yaw that faces along (dx, dz): 0 faces -Z, 90 degrees faces -X, as for the player. */
export function headingOf(dx: number, dz: number): number {
  return Math.atan2(-dx, -dz);
}

/** The shortest signed turn from `from` to `to`, in radians between -PI and PI. */
export function angleDelta(from: number, to: number): number {
  const d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) return d - Math.PI * 2;
  if (d < -Math.PI) return d + Math.PI * 2;
  return d;
}

export interface WalkStep {
  /** Where to head next, or null while standing. */
  target: Vec2 | null;
  /** Index of the waypoint reached this step, if any. */
  arrived: number | null;
  done: boolean;
}

/**
 * Walks a list of waypoints in order, standing at each for its `wait`. With `loop`, it starts
 * over after the last one. It only decides where to go; the caller moves and turns the body.
 */
export class Route {
  private index = 0;
  private waiting = 0;
  private finished = false;

  constructor(
    private readonly points: readonly Waypoint[],
    private readonly loop = false,
  ) {
    if (points.length === 0) this.finished = true;
  }

  get done(): boolean {
    return this.finished;
  }

  /** The waypoint being walked to, or stood at. */
  get current(): Waypoint | null {
    return this.finished ? null : this.points[this.index]!;
  }

  /** Index of the waypoint being walked to, or stood at. */
  get currentIndex(): number {
    return this.index;
  }

  get standing(): boolean {
    return this.waiting > 0;
  }

  /**
   * Advances the route for a body at `at` that moves `reach` meters this frame. Returns the
   * point to head for, or null while standing at a waypoint or after the end.
   */
  step(at: Vec2, reach: number, dt: number): WalkStep {
    if (this.finished) return { target: null, arrived: null, done: true };
    if (this.waiting > 0) {
      this.waiting -= dt;
      if (this.waiting > 0) return { target: null, arrived: null, done: false };
      this.advance();
      if (this.finished) return { target: null, arrived: null, done: true };
    }
    const point = this.points[this.index]!;
    if (Math.hypot(point.x - at.x, point.z - at.z) > Math.max(reach, 0.05)) return { target: point, arrived: null, done: false };

    const arrived = this.index;
    if (point.wait && point.wait > 0) {
      this.waiting = point.wait;
      return { target: null, arrived, done: false };
    }
    this.advance();
    return { target: this.current, arrived, done: this.finished };
  }

  private advance(): void {
    this.waiting = 0;
    this.index++;
    if (this.index < this.points.length) return;
    if (this.loop) this.index = 0;
    else this.finished = true;
  }
}
