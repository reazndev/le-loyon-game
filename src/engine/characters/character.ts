import { MathUtils, Vector3 } from 'three';
import { Emitter } from '../events';
import type { Vec2 } from '../physics/collision';
import type { CharacterModel } from './model';
import { angleDelta, headingOf, Route, type Waypoint } from './motion';

/** How a body turns toward where it wants to face. */
export type TurnStyle =
  /** Turns while it walks, like anyone. */
  | 'smooth'
  /** Stands dead still for a moment, then turns all at once. Le Loyon. */
  | 'stiff';

export interface CharacterOptions {
  /** Varies idle timing between characters. */
  seed?: number;
  turn?: TurnStyle;
  /** Ground height under a point, so the feet follow slopes. */
  ground?: (x: number, z: number) => number;
}

export interface WalkOptions {
  loop?: boolean;
  /** Meters per second. Defaults to the model's walking speed. */
  speed?: number;
}

const SMOOTH_TURN = 3.2;
const STIFF_TURN = 5.5;
const STIFF_PAUSE = 0.7;
/** Radians off target before a stiff body bothers to turn. */
const STIFF_SLACK = 0.12;

/**
 * A character in the world: a posed model that walks routes, follows a leader, turns to
 * face, and looks at points. Its state lives on `root`, so placing the root places it.
 */
export class Character {
  /** `step` on every footfall; `arrive` with the waypoint index when a walk reaches one. */
  readonly events = new Emitter<{ step: Vec2; arrive: number }>();
  /** A world point the head turns toward, or null to look ahead. */
  lookAt: Vector3 | null = null;
  /** When the head can't reach `lookAt`, turn the body too. */
  turnToLook = false;
  private route: Route | null = null;
  private routeSpeed = 0;
  private routeDone: (() => void) | null = null;
  private leader: { target: () => Vec2; distance: number } | null = null;
  private facing: number | null = null;
  private time = 0;
  private phase = 0;
  private walkBlend = 0;
  private stiffWait = 0;
  private readonly head = { yaw: 0, pitch: 0 };
  private readonly seed: number;
  private readonly turnStyle: TurnStyle;

  constructor(
    readonly model: CharacterModel,
    private readonly options: CharacterOptions = {},
  ) {
    this.seed = options.seed ?? Math.random() * 100;
    this.turnStyle = options.turn ?? 'smooth';
    model.pose({ t: 0, phase: 0, walk: 0, seed: this.seed }, this.head);
  }

  get root() {
    return this.model.root;
  }

  get position(): Vector3 {
    return this.model.root.position;
  }

  /** Radians, the level's yaw convention. */
  get yaw(): number {
    return this.model.root.rotation.y;
  }

  set yaw(value: number) {
    this.model.root.rotation.y = value;
    this.facing = null;
  }

  get walking(): boolean {
    return this.walkBlend > 0.5;
  }

  /** Walks through the points. Resolves at the end, or when the walk is replaced or stopped. */
  walk(points: readonly Waypoint[], options: WalkOptions = {}): Promise<void> {
    this.finishWalk();
    this.leader = null;
    this.route = new Route(points, options.loop ?? false);
    this.routeSpeed = options.speed ?? this.model.walkSpeed;
    return new Promise((resolve) => (this.routeDone = resolve));
  }

  walkTo(x: number, z: number, options: WalkOptions = {}): Promise<void> {
    return this.walk([{ x, z }], options);
  }

  /** Keeps about `distance` meters behind a moving target, such as the player. */
  follow(target: () => Vec2, distance = 2.5): void {
    this.finishWalk();
    this.leader = { target, distance };
  }

  /** Stops walking and following. */
  stop(): void {
    this.finishWalk();
    this.leader = null;
  }

  /** Turns the body to a yaw in radians, or toward a point. */
  face(target: number | Vec2): void {
    this.facing = typeof target === 'number' ? target : headingOf(target.x - this.position.x, target.z - this.position.z);
  }

  /** The route being walked, for callers that time things by waypoint. */
  get currentRoute(): Route | null {
    return this.route;
  }

  update(dt: number): void {
    this.time += dt;
    const moved = this.move(dt);
    const p = this.position;
    if (this.options.ground) p.y = this.options.ground(p.x, p.z);

    const before = this.phase;
    this.phase += moved / this.model.stride;
    // Two steps per stride cycle.
    if (Math.floor(before * 2) !== Math.floor(this.phase * 2)) this.events.emit('step', { x: p.x, z: p.z });
    this.walkBlend = MathUtils.damp(this.walkBlend, moved > 1e-4 ? 1 : 0, 7, dt);
    this.updateHead(dt);
    this.model.pose({ t: this.time, phase: this.phase, walk: this.walkBlend, seed: this.seed }, this.head);
  }

  /** Moves along the route or after the leader. Returns meters moved. */
  private move(dt: number): number {
    const p = this.position;
    let target: Vec2 | null = null;
    let speed = this.routeSpeed;
    if (this.route) {
      const step = this.route.step({ x: p.x, z: p.z }, speed * dt, dt);
      target = step.target;
      if (step.arrived !== null) this.events.emit('arrive', step.arrived);
      if (step.done) this.finishWalk();
    } else if (this.leader) {
      const lead = this.leader.target();
      const gap = Math.hypot(lead.x - p.x, lead.z - p.z);
      speed = this.model.walkSpeed * (gap > this.leader.distance * 2 ? 1.6 : 1);
      if (gap > this.leader.distance + 0.4) target = lead;
      else if (gap > 0.1) this.facing = headingOf(lead.x - p.x, lead.z - p.z);
    }

    if (!target) {
      if (this.facing !== null) this.turnToward(this.facing, dt);
      return 0;
    }
    const dx = target.x - p.x;
    const dz = target.z - p.z;
    const off = this.turnToward(headingOf(dx, dz), dt);
    // Slow down in sharp turns; a stiff body doesn't move at all until it faces the way.
    const pace = this.turnStyle === 'stiff' ? (Math.abs(off) < STIFF_SLACK ? 1 : 0) : Math.max(0, Math.cos(off));
    const distance = Math.min(Math.hypot(dx, dz), speed * pace * dt);
    if (distance <= 0) return 0;
    const length = Math.hypot(dx, dz);
    p.x += (dx / length) * distance;
    p.z += (dz / length) * distance;
    return distance;
  }

  /** Turns toward a yaw. Returns how far off it still is. */
  private turnToward(goal: number, dt: number): number {
    const off = angleDelta(this.yaw, goal);
    if (this.turnStyle === 'stiff') {
      if (Math.abs(off) < STIFF_SLACK) {
        this.stiffWait = 0;
        return off;
      }
      this.stiffWait += dt;
      if (this.stiffWait < STIFF_PAUSE) return off;
    }
    const rate = this.turnStyle === 'stiff' ? STIFF_TURN : SMOOTH_TURN;
    const turn = Math.sign(off) * Math.min(Math.abs(off), rate * dt);
    this.model.root.rotation.y += turn;
    return off - turn;
  }

  private updateHead(dt: number): void {
    let yaw = 0;
    let pitch = 0;
    if (this.lookAt) {
      const p = this.position;
      const dx = this.lookAt.x - p.x;
      const dz = this.lookAt.z - p.z;
      const wanted = angleDelta(this.yaw, headingOf(dx, dz));
      const limit = this.model.neckLimit;
      yaw = MathUtils.clamp(wanted, -limit, limit);
      pitch = Math.atan2(this.lookAt.y - (p.y + this.model.eyeHeight), Math.hypot(dx, dz)) * 0.6;
      if (this.turnToLook && Math.abs(wanted) > limit * 0.8 && !this.route && !this.leader) this.facing = headingOf(dx, dz);
    }
    const rate = this.turnStyle === 'stiff' ? 2 : 6;
    this.head.yaw = MathUtils.damp(this.head.yaw, yaw, rate, dt);
    this.head.pitch = MathUtils.damp(this.head.pitch, pitch, rate, dt);
  }

  private finishWalk(): void {
    const done = this.routeDone;
    this.route = null;
    this.routeDone = null;
    done?.();
  }
}
