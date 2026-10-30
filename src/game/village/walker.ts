import { BoxGeometry, Mesh, Vector3, type Object3D } from 'three';
import type { Point3 } from '../../engine/audio/audioManager';
import { playFootstep } from '../../engine/audio/footsteps';
import { buildCow } from '../../engine/characters/animals';
import { Character } from '../../engine/characters/character';
import { buildHuman } from '../../engine/characters/human';
import { angleDelta, headingOf, type Waypoint } from '../../engine/characters/motion';
import { cowbell } from '../../engine/characters/voices';
import { createPs1Material, type Ps1Material } from '../../engine/render/ps1Material';
import { doorShut } from '../../levels/inn/sounds';
import type { KitContext, Placed } from '../kit/builders';
import type { LevelKit } from '../kit/levelKit';
import { folk, type FolkId } from './folk';
import { bicycleBell, broomStroke, freewheel } from './sounds';

/** A stop on a walker's way. The first and last stops are where it comes from and goes to. */
export interface Stop extends Waypoint {
  /** A house door: the walker comes out of it or goes in, and the door is heard shutting. */
  door?: boolean;
}

export interface WalkerOptions {
  look: FolkId;
  /**
   * From one end to the other. Put the ends in the fog, 25 m or more from where the player
   * stands, or at a door, so the walker appears and vanishes out of sight. Each pass walks it
   * the other way, so people go somewhere and come back.
   */
  route: Stop[];
  /** Meters per second. A child runs at about 2.6. */
  speed?: number;
  /** Seconds out of sight between passes. */
  rest?: number;
  /** Seconds before the first pass. Default a random part of `rest`. */
  firstIn?: number;
  /** One pass only, such as someone going home at night. */
  once?: boolean;
  /** Something held in the right hand, such as a shopping bag or a broom, built hanging from its origin. */
  inHand?: Placed;
  /** Something pushed or carried in front, such as a barrow. Local coordinates of the walker: -Z is ahead. */
  inFront?: Placed;
  /** Rides this bicycle instead of walking. Built with its front toward -Z and the saddle over the origin. */
  rides?: Placed;
  /** What the walker does while standing at a stop. */
  activity?: 'sweep' | 'smoke';
  /** Leads a cow on a rope, its bell clanking. */
  leadsCow?: boolean;
  /** Played now and then on a step, for a barrow's wheel. */
  stepSound?: (at: Point3) => void;
  /** At a stop, turns to face the player wherever they are and watches them until it walks on. */
  stares?: boolean;
  /** Footstep loudness, 1 for an adult's ordinary step. */
  tread?: number;
}

/** How close the player can come ahead of a walker before it stops for them. */
const GIVE_WAY = 1.6;
/** Seconds standing in someone's way before stepping round them. */
const STEP_ROUND = 1.4;
/** Within this distance villagers turn their heads to the stranger. */
const NOTICE = 5;
const HEARD = 18;
/** Walkers come and go only farther than this from the player, so nobody pops in or out in view. */
const OUT_OF_SIGHT = 16;
const SEAT = 0.8;
const RIDE_TURN = 1.6;

/**
 * Someone from the village going about their day in the background: out of the fog or a door,
 * along the street, and away again, with a walk cycle, footsteps, and whatever they carry. They
 * stop for the player and step round them, and turn their heads to watch the stranger pass.
 * Nobody can be spoken to. Place walkers at the top level of `build`.
 */
export function walker(kit: LevelKit, options: WalkerOptions): Walker {
  return kit.use((ctx) => new Walker(ctx, options));
}

export class Walker {
  readonly character: Character;
  private readonly cow: Character | null = null;
  private readonly ember: Ps1Material | null = null;
  private legs: Stop[];
  private leg = 0;
  private offstage: number;
  private waitLeft = 0;
  private blocked = 0;
  private detour: Vector3 | null = null;
  /** Walking on past the end of the route until the player can no longer see them. */
  private walkingOn = false;
  private time = Math.random() * 10;
  private done = false;
  private readonly eye = new Vector3();

  constructor(
    private readonly ctx: KitContext,
    private readonly options: WalkerOptions,
  ) {
    const model = buildHuman(folk[options.look], ctx.world.textures);
    const ground = (x: number, z: number) => ctx.world.ground.sample(x, z, model.root.position.y).height;
    this.character = new Character(model, { ground, seed: Math.random() * 100 });
    ctx.world.scene.add(model.root);
    this.legs = options.route;
    this.offstage = options.firstIn ?? Math.random() * (options.rest ?? 30);
    this.show(false);

    if (options.inHand && model.hand) model.hand.add(options.inHand.object);
    if (options.inFront) model.root.add(options.inFront.object);
    if (options.rides) {
      model.root.add(options.rides.object);
      this.character.sit(SEAT, { instantly: true });
    }
    if (options.activity === 'smoke' && model.hand) this.ember = this.cigarette(model.hand);
    if (options.leadsCow) {
      const cow = buildCow();
      this.cow = new Character(cow, { ground: (x, z) => ctx.world.ground.sample(x, z, cow.root.position.y).height });
      ctx.world.scene.add(cow.root);
      this.cow.events.on('step', (at) => Math.random() < 0.5 && this.heard(at) && cowbell(ctx.audio, { at: { ...at, y: 0.9 }, volume: 0.35 }));
    }
    this.character.events.on('step', (at) => {
      if (!this.heard(at)) return;
      const surface = ctx.world.ground.sample(at.x, at.z).surface;
      playFootstep(ctx.audio, surface, { at: { ...at, y: this.character.position.y + 0.05 }, level: 0.45 * (options.tread ?? 1) });
      if (Math.random() < 0.35) options.stepSound?.({ ...at, y: 0.4 });
    });
    ctx.later('register', () => ctx.world.updates.add((dt) => this.update(dt)));
  }

  /** Where the walker, and the cow if there is one, are while they are out in the street. */
  get bodies(): Vector3[] {
    if (!this.character.root.visible) return [];
    return this.cow ? [this.character.position, this.cow.position] : [this.character.position];
  }

  /** Out in the street and standing at a stop, such as the smoker in the doorway. */
  get standing(): boolean {
    return this.character.root.visible && this.waitLeft > 0;
  }

  private update(dt: number): void {
    if (this.done || this.ctx.scene.paused) return;
    this.time += dt;
    if (this.offstage > 0) {
      this.offstage -= dt;
      const start = this.legs[0];
      if (this.offstage <= 0 && start && !start.door && this.inSight(start)) this.offstage = 2;
      else if (this.offstage <= 0) this.enter();
      return;
    }
    const stop = this.legs[this.leg]!;
    if (this.waitLeft > 0) this.stand(dt);
    else this.walk(dt, stop);
    this.watchPlayer();
    this.character.update(dt);
    this.cow?.update(dt);
  }

  private enter(): void {
    const [start] = this.legs;
    if (!start) return;
    this.character.position.set(start.x, 0, start.z);
    this.character.yaw = this.legs[1] ? headingOf(this.legs[1].x - start.x, this.legs[1].z - start.z) : 0;
    // The cow comes on behind, at the end of its rope.
    this.cow?.position.set(start.x + Math.sin(this.character.yaw) * 2, 0, start.z + Math.cos(this.character.yaw) * 2);
    this.cow?.follow(() => this.character.position, 1.9);
    this.leg = 1;
    this.waitLeft = 0;
    this.blocked = 0;
    this.detour = null;
    this.walkingOn = false;
    this.show(true);
    if (start.door) doorShut(this.ctx.audio, { x: start.x, y: 1.2, z: start.z }, 0.4);
  }

  private exit(stop: Stop): void {
    this.show(false);
    this.character.stop();
    this.cow?.stop();
    if (stop.door) doorShut(this.ctx.audio, { x: stop.x, y: 1.2, z: stop.z }, 0.4);
    if (this.options.once) {
      this.done = true;
      return;
    }
    this.legs = [...this.legs].reverse();
    this.offstage = this.options.rest ?? 30;
  }

  private walk(dt: number, stop: Stop): void {
    const p = this.character.position;
    const target = this.detour ?? stop;
    // Once stepping round, it carries on round, or it would stop again for the same player.
    if (!this.detour && this.inTheWay()) {
      this.giveWay(dt);
      return;
    }
    this.blocked = 0;
    const left = Math.hypot(target.x - p.x, target.z - p.z);
    if (left < 0.3) {
      this.arrive(stop);
      return;
    }
    if (this.options.rides) this.ride(dt, target);
    else if (!this.character.currentRoute) void this.character.walk([{ x: target.x, z: target.z }], { speed: this.options.speed });
  }

  private arrive(stop: Stop): void {
    const last = this.leg === this.legs.length - 1;
    if (this.detour) {
      this.detour = null;
      if (!this.walkingOn) return;
    }
    if (last) {
      this.leave(stop);
      return;
    }
    this.leg++;
    this.waitLeft = stop.wait ?? 0;
    if (this.waitLeft > 0) this.character.stop();
  }

  /** Goes in at a door, or out of sight into the fog: on along the same way while the player could still see. */
  private leave(stop: Stop): void {
    const p = this.character.position;
    this.walkingOn = !stop.door && this.inSight(p);
    if (!this.walkingOn) {
      this.exit(stop);
      return;
    }
    const yaw = this.character.yaw;
    this.detour = new Vector3(p.x - Math.sin(yaw) * 6, 0, p.z - Math.cos(yaw) * 6);
  }

  /** The player is just ahead, on the walker's way. */
  private inTheWay(): boolean {
    const p = this.character.position;
    const player = this.ctx.scene.player.position;
    const dx = player.x - p.x;
    const dz = player.z - p.z;
    const distance = Math.hypot(dx, dz);
    const reach = this.options.rides ? GIVE_WAY * 1.6 : GIVE_WAY;
    if (distance > reach) return false;
    const yaw = this.character.yaw;
    const ahead = (-Math.sin(yaw) * dx - Math.cos(yaw) * dz) / distance;
    return ahead > 0.3;
  }

  /** Stops, then after a moment steps round the player on the side away from them. A rider rings instead. */
  private giveWay(dt: number): void {
    if (this.blocked === 0) {
      this.character.stop();
      if (this.options.rides) bicycleBell(this.ctx.audio, this.at(1.1));
    }
    this.blocked += dt;
    if (this.blocked < STEP_ROUND || this.options.rides || this.detour) return;
    const p = this.character.position;
    const player = this.ctx.scene.player.position;
    const yaw = this.character.yaw;
    const side = Math.sign((player.x - p.x) * Math.cos(yaw) - (player.z - p.z) * Math.sin(yaw)) || 1;
    const aside = { x: p.x - Math.cos(yaw) * side * 1.1 - Math.sin(yaw) * 1.2, z: p.z + Math.sin(yaw) * side * 1.1 - Math.cos(yaw) * 1.2 };
    const free = this.ctx.world.collision.resolve(aside.x, aside.z, 0.3);
    this.detour = new Vector3(free.x, 0, free.z);
    this.blocked = 0;
    void this.character.walk([{ x: free.x, z: free.z }], { speed: this.options.speed });
  }

  /** Coasts toward the target seated on the bicycle, turning gently, and the freewheel ticks now and then. */
  private ride(dt: number, target: { x: number; z: number }): void {
    const c = this.character;
    const goal = headingOf(target.x - c.position.x, target.z - c.position.z);
    const off = angleDelta(c.yaw, goal);
    c.yaw += Math.sign(off) * Math.min(Math.abs(off), RIDE_TURN * dt);
    const speed = (this.options.speed ?? 2.2) * Math.max(0.3, Math.cos(off));
    c.position.x -= Math.sin(c.yaw) * speed * dt;
    c.position.z -= Math.cos(c.yaw) * speed * dt;
    if (Math.random() < dt / 4 && this.heard(c.position)) freewheel(this.ctx.audio, this.at(0.4));
  }

  private stand(dt: number): void {
    this.waitLeft -= dt;
    if (this.options.stares) this.character.face(this.ctx.scene.player.position);
    if (this.options.activity === 'sweep') this.sweep(dt);
    if (this.options.activity === 'smoke') this.smoke();
    if (this.waitLeft > 0) return;
    this.character.model.holding = false;
    if (this.options.activity === 'sweep' && this.options.inHand) this.options.inHand.object.rotation.z = 0;
  }

  /** The broom goes back and forth across the step, with a scrape on each push. */
  private sweep(dt: number): void {
    const broom = this.options.inHand?.object;
    if (!broom) return;
    const swing = Math.sin(this.time * 2.6);
    broom.rotation.z = 0.5 * swing;
    if (Math.sin((this.time - dt) * 2.6) < 0.9 && swing >= 0.9 && Math.random() < 0.5 && this.heard(this.character.position)) broomStroke(this.ctx.audio, this.at(0.1));
  }

  /** Every few seconds the cigarette comes up and the ember brightens on the draw. */
  private smoke(): void {
    const cycle = this.time % 9;
    const drawing = cycle < 1.8;
    this.character.model.holding = drawing;
    const glow = drawing ? 0.6 + 0.4 * Math.sin(cycle * 2) : 0.35;
    this.ember?.uniforms.uColor.value.setRGB(glow, glow * 0.4, glow * 0.12);
  }

  /** Villagers in a small place look at a stranger: the head turns when the player comes near. */
  private watchPlayer(): void {
    const camera = this.ctx.scene.player.camera.position;
    const near = this.character.position.distanceTo(this.ctx.scene.player.position) < NOTICE;
    const staring = this.options.stares && this.waitLeft > 0;
    this.character.lookAt = near || staring || this.blocked > 0 ? this.eye.copy(camera) : null;
  }

  /** A cigarette between the fingers; returns the ember's material, which the draws brighten. */
  private cigarette(hand: Object3D): Ps1Material {
    const material = createPs1Material({ color: 0x5a2008, unlit: true });
    hand.add(new Mesh(new BoxGeometry(0.012, 0.012, 0.06).translate(0, -0.02, -0.05), material));
    return material;
  }

  private show(on: boolean): void {
    this.character.root.visible = on;
    if (this.cow) this.cow.root.visible = on;
  }

  private fromPlayer(at: { x: number; z: number }): number {
    const player = this.ctx.scene.player.position;
    return Math.hypot(at.x - player.x, at.z - player.z);
  }

  private heard(at: { x: number; z: number }): boolean {
    return this.character.root.visible && this.fromPlayer(at) < HEARD;
  }

  private inSight(at: { x: number; z: number }): boolean {
    return this.fromPlayer(at) < OUT_OF_SIGHT;
  }

  private at(height: number): Point3 {
    const p = this.character.position;
    return { x: p.x, y: p.y + height, z: p.z };
  }
}
