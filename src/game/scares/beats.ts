import type { CharacterId } from '../../engine/characters/cast';
import type { Waypoint } from '../../engine/characters/motion';
import { containsPoint, type Shape, type Vec2 } from '../../engine/physics/collision';
import type { Surface } from '../../engine/physics/ground';
import { check, type Condition, type StateView } from '../conditions';
import type { SceneContext } from '../scene';
import type { SoundId } from './sounds';

/** A circle or a rectangle on the ground, centered on (x, z). */
export type Zone = Vec2 & ({ r: number } | { w: number; d: number });

/** What sets a beat off. A list means all of them at once. */
export type Trigger =
  /** The player walks into the zone. Starting inside doesn't count. */
  | { enter: Zone }
  /** The flag is set. */
  | { flag: string }
  /** Seconds since the scene loaded. */
  | { after: number }
  /** The player looks at a point: within `angle` degrees (default 10) of the view center,
   * closer than `within` meters (default 20), for `hold` seconds (default 0.4). */
  | { look: Vec2 & { y?: number; angle?: number; within?: number; hold?: number } };

/**
 * A figure in the fog. It appears only while its spot is out of view, so the player turns and
 * it is there. It ends in one of these ways, whichever comes first:
 * - `vanish: 'seen'` (default): gone after being looked at directly for `hold` seconds.
 * - `vanish: 'unseen'`: gone the first time it leaves the view after being seen.
 * - `vanish: 'never'`: stays until approached.
 * - The player comes within `near` meters (default 8): it walks off along `leave`, or is gone.
 * With `walk`, it walks those points slowly and is gone at the end.
 */
export interface FigureSpec {
  /** Default `marc`, Le Loyon. */
  who?: CharacterId;
  at: Vec2;
  /** Degrees, or `player` to face the player (default). */
  face?: number | 'player';
  walk?: Waypoint[];
  vanish?: 'seen' | 'unseen' | 'never';
  hold?: number;
  near?: number;
  /** Where it walks when the player comes near, instead of vanishing on the spot. */
  leave?: Waypoint[];
  /** Gone after this many seconds even if never seen. */
  timeout?: number;
}

export type Place = Vec2 | 'behind' | 'ahead' | 'left' | 'right';

/** One thing a beat does. `after` delays it, in seconds from the beat firing. */
export type ScareAction = { after?: number } & (
  | { figure: FigureSpec }
  /** A one-shot sound from a point, or `distance` meters (default 12) from the player in a direction. */
  | { sound: SoundId; at?: Place; distance?: number; volume?: number }
  /** Footsteps behind the player that walk when they walk and stop one step after they stop. */
  | { stalk: { surface?: Surface; steps?: number; distance?: number } }
  /** Every ambient bed fades out over 1.5 s and stays out for this many seconds. */
  | { silence: number }
  /** The fog closes in: `far` and `density` ease to these values, hold for `seconds`, and ease back. */
  | { fog: { far?: number; density?: number; seconds: number; fade?: number } }
  /** The loud hit of a real jumpscare. Default `sfx_hit`. */
  | { stinger: SoundId | true; at?: Place }
  /** Anything else, such as a dialogue. */
  | { run: (ctx: SceneContext) => void | Promise<void> }
);

export interface Beat {
  /** The beat id from docs/script/07-scares.md. */
  id: string;
  when: Trigger | Trigger[];
  /** A game-state condition that must also hold. */
  if?: Condition;
  do: ScareAction[];
  /** A flag to set when it fires. A beat whose flag is already set never fires again. */
  set?: string;
  /** Lets the beat fire again after its triggers stop holding, at most every `repeat` seconds. */
  repeat?: number;
}

/** What the player is doing this frame, as far as triggers care. */
export interface Senses {
  x: number;
  z: number;
  /** Eye position and unit view direction. */
  eye: { x: number; y: number; z: number };
  view: { x: number; y: number; z: number };
  /** Seconds since the scene loaded. */
  time: number;
  state: StateView;
}

export function zoneShape(zone: Zone): Shape {
  return 'r' in zone ? { kind: 'circle', x: zone.x, z: zone.z, r: zone.r } : { kind: 'box', x: zone.x, z: zone.z, hw: zone.w / 2, hd: zone.d / 2, angle: 0 };
}

/** Degrees between the view direction and the direction to a point. */
export function viewAngle(senses: Pick<Senses, 'eye' | 'view'>, point: { x: number; y: number; z: number }): number {
  const dx = point.x - senses.eye.x;
  const dy = point.y - senses.eye.y;
  const dz = point.z - senses.eye.z;
  const length = Math.hypot(dx, dy, dz) || 1;
  const cos = (dx * senses.view.x + dy * senses.view.y + dz * senses.view.z) / length;
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

interface BeatState {
  beat: Beat;
  triggers: Trigger[];
  /** `enter` zones the player started in: they count only after the player has left once. */
  blocked: boolean[];
  /** Seconds each `look` trigger has been held. */
  looked: number[];
  armed: boolean;
  lastFired: number;
  spent: boolean;
}

/**
 * Decides which beats fire. Pure: feed it senses each frame and it returns the beats whose
 * triggers and condition all hold. A beat fires once unless it has `repeat`.
 */
export class BeatTracker {
  private readonly states: BeatState[];
  private first = true;

  constructor(beats: Beat[]) {
    this.states = beats.map((beat) => {
      const triggers = Array.isArray(beat.when) ? beat.when : [beat.when];
      return { beat, triggers, blocked: triggers.map(() => false), looked: triggers.map(() => 0), armed: true, lastFired: -Infinity, spent: false };
    });
  }

  update(senses: Senses, dt: number): Beat[] {
    const fired = this.states.filter((s) => this.evaluate(s, senses, dt)).map((s) => s.beat);
    this.first = false;
    return fired;
  }

  private evaluate(s: BeatState, senses: Senses, dt: number): boolean {
    const holds = s.triggers.map((trigger, i) => this.holds(s, trigger, i, senses, dt));
    if (s.spent || (s.beat.set && senses.state.hasFlag(s.beat.set))) return false;
    const ready = holds.every(Boolean) && check(s.beat.if, senses.state);
    if (!ready) {
      s.armed = true;
      return false;
    }
    if (!s.armed || senses.time - s.lastFired < (s.beat.repeat ?? 0)) return false;
    s.armed = false;
    s.lastFired = senses.time;
    if (s.beat.repeat === undefined) s.spent = true;
    return true;
  }

  private holds(s: BeatState, trigger: Trigger, i: number, senses: Senses, dt: number): boolean {
    if ('flag' in trigger) return senses.state.hasFlag(trigger.flag);
    if ('after' in trigger) return senses.time >= trigger.after;
    if ('enter' in trigger) {
      const inside = containsPoint(zoneShape(trigger.enter), senses.x, senses.z);
      if (this.first) s.blocked[i] = inside;
      if (!inside) s.blocked[i] = false;
      return inside && !s.blocked[i];
    }
    const look = trigger.look;
    const point = { x: look.x, y: look.y ?? 1.5, z: look.z };
    const close = Math.hypot(point.x - senses.eye.x, point.z - senses.eye.z) <= (look.within ?? 20);
    const centered = viewAngle(senses, point) <= (look.angle ?? 10);
    if (!close || !centered) {
      s.looked[i] = 0;
      return false;
    }
    s.looked[i] = s.looked[i]! + dt;
    return s.looked[i]! >= (look.hold ?? 0.4);
  }
}
