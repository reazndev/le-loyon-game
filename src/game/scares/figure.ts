import { MathUtils, Vector3 } from 'three';
import type { Character, WalkOptions } from '../../engine/characters/character';
import { headingOf } from '../../engine/characters/motion';
import type { FigureSpec } from './beats';

/** Degrees off the view center past which a spot counts as out of view. Wider than the screen. */
export const OUT_OF_VIEW = 50;
/** Degrees off center that count as on screen. */
export const IN_VIEW = 38;
/** Degrees off center that count as looking straight at it. */
export const LOOKED_AT = 12;
/** Seconds after being seen before the eyes start to light, and how long they take to light and go dark. */
const EYES_AFTER = 1;
const EYES_FOR = 2.2;

/** How lit the eyes are `seenFor` seconds after the figure was seen: one slow swell up and down. */
const eyeGlow = (seenFor: number) => {
  const t = (seenFor - EYES_AFTER) / EYES_FOR;
  return t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0;
};

/** Where the player is looking from and how far they can see. */
export interface Viewer {
  eye: Vector3;
  /** Degrees between the view center and a point. */
  angleTo(point: Vector3): number;
  /** Meters past which the fog hides everything. */
  sight: number;
}

type Phase = 'waiting' | 'shown' | 'leaving' | 'gone';

/** Runs one staged figure from appearing out of view to vanishing. See `FigureSpec`. */
export class Figure {
  private phase: Phase = 'waiting';
  private elapsed = 0;
  private lookedFor = 0;
  private seen = false;
  private seenFor = 0;
  private readonly head = new Vector3();

  constructor(
    private readonly character: Character,
    private readonly spec: FigureSpec,
  ) {
    character.root.visible = false;
  }

  get done(): boolean {
    return this.phase === 'gone';
  }

  update(dt: number, viewer: Viewer): void {
    if (this.phase === 'gone') return;
    this.elapsed += dt;
    if (this.phase === 'waiting') return this.tryAppear(viewer);

    const c = this.character;
    this.head.set(c.position.x, c.position.y + c.model.eyeHeight, c.position.z);
    const distance = Math.hypot(this.head.x - viewer.eye.x, this.head.z - viewer.eye.z);
    const angle = viewer.angleTo(this.head);
    const inView = angle < IN_VIEW && distance < viewer.sight;
    this.lookedFor = angle < LOOKED_AT && distance < viewer.sight ? this.lookedFor + dt : 0;
    if (this.lookedFor >= (this.spec.hold ?? 0.8)) this.seen = true;
    if (this.phase === 'leaving') return;
    if (this.seen) this.seenFor += dt;
    if (this.spec.eyes) c.model.eyes?.(eyeGlow(this.seenFor));

    const vanish = this.spec.vanish ?? 'seen';
    if (distance < (this.spec.near ?? 8)) return this.leave();
    if (this.spec.stare !== undefined && this.seenFor >= this.spec.stare) return this.leave();
    if (vanish === 'seen' && this.seen) return this.hide();
    if (vanish === 'unseen' && this.seen && !inView) return this.hide();
    if (this.spec.timeout !== undefined && this.elapsed > this.spec.timeout && !inView) this.hide();
  }

  /** Takes the figure away at once. */
  hide(): void {
    this.phase = 'gone';
    this.character.stop();
    this.character.lookAt = null;
    this.character.turnToLook = false;
    this.character.model.eyes?.(0);
    this.character.root.visible = false;
  }

  private get pace(): WalkOptions {
    return this.spec.speed ? { speed: this.spec.speed } : {};
  }

  private tryAppear(viewer: Viewer): void {
    const { at } = this.spec;
    const spot = new Vector3(at.x, viewer.eye.y, at.z);
    if (viewer.angleTo(spot) < OUT_OF_VIEW) return;

    const c = this.character;
    c.position.set(at.x, c.position.y, at.z);
    const face = this.spec.face ?? 'player';
    c.yaw = face === 'player' ? headingOf(viewer.eye.x - at.x, viewer.eye.z - at.z) : MathUtils.degToRad(face);
    c.root.visible = true;
    this.phase = 'shown';
    this.elapsed = 0;
    this.spec.onShow?.();
    if (this.spec.walk) void c.walk(this.spec.walk, this.pace).then(() => this.phase === 'shown' && this.hide());
    else {
      c.lookAt = viewer.eye;
      // One that stares keeps its whole body turned to the player.
      c.turnToLook = this.spec.stare !== undefined;
    }
  }

  private leave(): void {
    if (!this.spec.leave) return this.hide();
    this.phase = 'leaving';
    this.character.lookAt = null;
    this.character.turnToLook = false;
    this.character.model.eyes?.(0);
    this.spec.onLeave?.();
    void this.character.walk(this.spec.leave, this.pace).then(() => this.phase === 'leaving' && this.hide());
  }
}
