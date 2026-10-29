import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { Emitter } from './events';
import type { Movement } from './input/input';
import type { CollisionWorld } from './physics/collision';
import type { GroundMap, Surface } from './physics/ground';

export const playerTuning = {
  eyeHeight: 1.65,
  radius: 0.3,
  /** Meters per second. */
  walkSpeed: 1.45,
  /** A hurried walk, not a run. */
  fastSpeed: 2.5,
  backSpeed: 0.9,
  /** Degrees per second. Slow on purpose: turning around should take a while. */
  turnSpeed: 95,
  fieldOfView: 60,
  /** Head bob height in meters. */
  bob: 0.028,
  /** Meters per footstep. */
  stride: 0.7,
  fastStride: 0.85,
  /** A slight downward tilt, so the ground ahead stays in view. */
  pitchDeg: -3,
};

export interface FootstepEvent {
  surface: Surface;
  x: number;
  z: number;
  fast: boolean;
}

export interface PlayerWorld {
  collision: CollisionWorld;
  ground: GroundMap;
}

/**
 * The first-person body: tank movement, ground following, head bob, and footsteps.
 * Yaw 0 looks down -Z; positive yaw turns left, the same as Three.js rotation around Y.
 */
export class Player {
  readonly camera = new PerspectiveCamera(playerTuning.fieldOfView, 4 / 3, 0.05, 100);
  readonly position = new Vector3();
  readonly events = new Emitter<{ footstep: FootstepEvent }>();
  yaw = 0;
  private stepPhase = 0;
  private bobWeight = 0;

  /** Puts the player at a spot instantly. `yawDeg` uses the same convention as `yaw`. */
  place(x: number, y: number, z: number, yawDeg: number): void {
    this.position.set(x, y, z);
    this.yaw = MathUtils.degToRad(yawDeg);
    this.stepPhase = 0;
    this.bobWeight = 0;
    this.syncCamera();
  }

  /** Unit vector the player faces, in the XZ plane. */
  forward(): Vector3 {
    return new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  update(dt: number, movement: Movement, fast: boolean, world: PlayerWorld): void {
    this.yaw -= MathUtils.degToRad(playerTuning.turnSpeed) * movement.turn * dt;

    const speed = movement.forward >= 0 ? (fast ? playerTuning.fastSpeed : playerTuning.walkSpeed) : playerTuning.backSpeed;
    const step = this.forward().multiplyScalar(movement.forward * speed * dt);
    const from = { x: this.position.x, z: this.position.z };
    const to = world.collision.move(from, { x: step.x, z: step.z }, playerTuning.radius);
    const moved = Math.hypot(to.x - from.x, to.z - from.z);
    this.position.x = to.x;
    this.position.z = to.z;

    const ground = world.ground.sample(to.x, to.z, this.position.y);
    // Ease onto the new height so steps and slopes don't jolt the camera.
    this.position.y += (ground.height - this.position.y) * Math.min(1, dt * 14);

    this.advanceSteps(moved, fast, ground.surface, dt);
    this.syncCamera();
  }

  private advanceSteps(moved: number, fast: boolean, surface: Surface, dt: number): void {
    const walking = moved > 1e-4;
    this.bobWeight = MathUtils.damp(this.bobWeight, walking ? 1 : 0, 8, dt);
    if (!walking) return;
    const before = this.stepPhase;
    this.stepPhase += moved / (fast ? playerTuning.fastStride : playerTuning.stride);
    if (Math.floor(this.stepPhase) > Math.floor(before)) {
      this.events.emit('footstep', { surface, x: this.position.x, z: this.position.z, fast });
    }
  }

  private syncCamera(): void {
    const wave = Math.sin(Math.PI * this.stepPhase);
    // The head is lowest when a foot lands, at whole step counts.
    const lift = Math.abs(wave) * playerTuning.bob * this.bobWeight;
    const sway = wave * playerTuning.bob * 0.4 * this.bobWeight;
    const right = new Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    this.camera.position.copy(this.position).addScaledVector(right, sway);
    this.camera.position.y += playerTuning.eyeHeight + lift;
    this.camera.rotation.set(MathUtils.degToRad(playerTuning.pitchDeg), this.yaw, 0, 'YXZ');
  }
}
