import { MathUtils, Mesh, CylinderGeometry, Vector3 } from 'three';
import { headingOf, type Waypoint } from '../../engine/characters/motion';
import { bark, growl } from '../../engine/characters/voices';
import { containsPoint, type Vec2 } from '../../engine/physics/collision';
import { createPs1Material } from '../../engine/render/ps1Material';
import type { KitContext } from '../kit/builders';
import { NpcBuilder } from '../kit/npc';
import { zoneShape, type Zone } from '../scares/beats';
import { playSound } from '../scares/sounds';
import { distanceToPath, noticed, TORCH_HALF_ANGLE, TORCH_RANGE, type Cause } from './detection';
import { TorchBeam } from './torch';

/** A stop on the round. `aim` points the torch at a spot while he waits; `gate` squeals as he passes. */
export interface PatrolStop extends Waypoint {
  aim?: Vec2;
  gate?: boolean;
}

export interface PatrolOptions {
  /**
   * The round, from offstage to offstage. Start it 20 m or more outside the grounds: the bell
   * and the whistle carry about that far ahead of him.
   */
  route: PatrolStop[];
  /** Seconds offstage between rounds. Change `patrol.rest` later to speed him up. */
  rest?: number;
  /** Seconds before the first round. Default `rest`. */
  firstIn?: number;
  /** One round only, as on night 1. */
  once?: boolean;
  /** Walking speed. Default 0.9 m/s. */
  speed?: number;
  /** Where the player's own flashlight gives them away: the cemetery. */
  grounds?: Zone[];
  /** Where being seen means being caught, such as around the open grave. */
  suspicious?: Zone[];
  /** Hiding spots where the torch never finds the player. */
  safe?: Zone[];
  /** Things he must not find, with a test for whether they are there now. */
  evidence?: { at: Vec2; active: () => boolean }[];
}

type Handler = (cause: Cause) => void;

const SMELL_RANGE = 3;
const SMELL_GRACE = 4;
const SEARCH_TIME = 3;
const WHISTLE_EVERY = 7;
const BARK_EVERY = 1.3;

/**
 * Raymond Bapst's round with Bari: bell, whistle, swinging torch, gate, and detection. Build it
 * with `kit.use(watchmanPatrol(options))`, then add `onSeen` and `onCaught`.
 */
export class Patrol {
  readonly raymond: NpcBuilder;
  readonly bari: NpcBuilder;
  rest: number;
  private readonly torch: TorchBeam;
  private readonly seenHandlers: Handler[] = [];
  private readonly caughtHandlers: Handler[] = [];
  private readonly roundHandlers: (() => void)[] = [];
  private state: 'resting' | 'walking' | 'caught' | 'done' = 'resting';
  private restLeft: number;
  private time = 0;
  private sweep = 0;
  private torchYaw = 0;
  private whistleIn = 2;
  private barkIn = 0;
  private seenThisRound = false;
  private smell: { since: number } | null = null;
  private growled = false;
  private searchLeft = 0;
  private readonly grounds;
  private readonly suspicious;
  private readonly safe;

  constructor(
    private readonly ctx: KitContext,
    private readonly options: PatrolOptions,
  ) {
    this.rest = options.rest ?? 40;
    this.restLeft = options.firstIn ?? this.rest;
    this.grounds = (options.grounds ?? []).map(zoneShape);
    this.suspicious = (options.suspicious ?? []).map(zoneShape);
    this.safe = (options.safe ?? []).map(zoneShape);
    this.raymond = this.cast('raymond');
    this.bari = this.cast('bari');
    this.torch = new TorchBeam(ctx);
    this.holdTorch();
    this.show(false);
    this.raymond.character.events.on('arrive', (index) => {
      const stop = options.route[index];
      if (stop?.gate) playSound(ctx.audio, 'sfx_gate_squeal', { at: this.at(stop, 1) });
    });
    ctx.later('register', () => ctx.world.updates.add((dt) => this.update(dt)));
  }

  /** Called when he sees the player somewhere that isn't suspicious. The level decides what follows. */
  onSeen(handler: Handler): this {
    this.seenHandlers.push(handler);
    return this;
  }

  /** Called once when he catches the player. The round stops, Bari barks, the torch stays on them. */
  onCaught(handler: Handler): this {
    this.caughtHandlers.push(handler);
    return this;
  }

  /** Called as each round starts, about 20 s before he reaches the grounds. */
  onRound(handler: () => void): this {
    this.roundHandlers.push(handler);
    return this;
  }

  get caught(): boolean {
    return this.state === 'caught';
  }

  /** Ends the round with the player caught, for example on a second sighting. */
  catch(cause: Cause = 'beam'): void {
    if (this.state === 'caught') return;
    this.state = 'caught';
    this.raymond.character.stop();
    this.bari.character.stop();
    this.caughtHandlers.forEach((handler) => handler(cause));
  }

  private update(dt: number): void {
    if (this.ctx.scene.paused && this.state !== 'caught') return;
    this.time += dt;
    if (this.state === 'resting') this.updateRest(dt);
    else if (this.state === 'walking') this.updateRound(dt);
    else if (this.state === 'caught') this.updateCaught(dt);
  }

  private updateRest(dt: number): void {
    this.restLeft -= dt;
    if (this.restLeft > 0) return;
    const [start] = this.options.route;
    if (!start) return;
    this.raymond.character.position.set(start.x, 0, start.z);
    this.bari.character.position.set(start.x + 0.8, 0, start.z + 0.8);
    this.show(true);
    this.state = 'walking';
    this.seenThisRound = false;
    this.growled = false;
    this.roundHandlers.forEach((handler) => handler());
    const speed = this.options.speed ?? 0.9;
    void this.raymond.character.walk(this.options.route, { speed }).then(() => this.endRound());
    this.bari.character.follow(() => this.heelSpot(), 0.6);
  }

  private endRound(): void {
    if (this.state !== 'walking') return;
    this.show(false);
    this.bari.character.stop();
    this.state = this.options.once ? 'done' : 'resting';
    this.restLeft = this.rest;
  }

  private updateRound(dt: number): void {
    const stop = this.currentStop();
    this.sweepTorch(dt, stop);
    this.whistle(dt);
    this.sniff(dt);

    const player = this.ctx.scene.player;
    const r = this.raymond.character.position;
    const cause = noticed({
      torch: { x: r.x, z: r.z, yaw: this.torchYaw, range: TORCH_RANGE, halfAngle: TORCH_HALF_ANGLE },
      watchman: r,
      player: { x: player.position.x, z: player.position.z, crouched: player.crouched, flashlight: this.ctx.world.lights.flashlightOn },
      inGrounds: this.inside(this.grounds),
      hidden: this.inside(this.safe),
      clearSight: () => this.clearSight(r, player.position),
      evidence: (this.options.evidence ?? []).filter((e) => e.active()).map((e) => e.at),
      investigating: this.searchLeft > 0,
    });
    if (!cause) return;
    if (cause !== 'beam' || this.inside(this.suspicious)) this.catch(cause);
    else if (!this.seenThisRound) {
      this.seenThisRound = true;
      this.seenHandlers.forEach((handler) => handler(cause));
    }
  }

  private updateCaught(dt: number): void {
    const player = this.ctx.scene.player.position;
    this.raymond.character.face(player);
    this.bari.character.face(player);
    this.aimTorch(headingOf(player.x - this.raymond.character.position.x, player.z - this.raymond.character.position.z), 0.08);
    this.barkIn -= dt;
    if (this.barkIn > 0) return;
    this.barkIn = BARK_EVERY + Math.random() * 0.6;
    bark(this.ctx.audio, { at: this.at(this.bari.character.position, 0.5) });
  }

  /** The torch swings as he walks, sweeps around `aim` while he stands, and finds a growl. */
  private sweepTorch(dt: number, stop: PatrolStop | null): void {
    this.sweep += dt;
    this.searchLeft = Math.max(0, this.searchLeft - dt);
    const r = this.raymond.character;
    const player = this.ctx.scene.player.position;
    let yaw = r.yaw + 0.35 * Math.sin(this.sweep * 0.9);
    if (this.searchLeft > 0) yaw = headingOf(player.x - r.position.x, player.z - r.position.z);
    else if (stop?.aim && r.currentRoute?.standing) yaw = headingOf(stop.aim.x - r.position.x, stop.aim.z - r.position.z) + 0.45 * Math.sin(this.sweep * 0.7);
    this.aimTorch(yaw, 0.12);
  }

  private aimTorch(yaw: number, pitch: number): void {
    this.torchYaw = yaw;
    const hand = this.raymond.character.model.hand;
    const origin = hand ? hand.getWorldPosition(new Vector3()) : this.raymond.character.position.clone().setY(1.2);
    this.torch.aim(origin, yaw, pitch);
  }

  /** A growl when the player hides too close to his path; if they stay, he turns the torch on them. */
  private sniff(dt: number): void {
    const player = this.ctx.scene.player.position;
    const near = this.bari.character.position.distanceTo(player) < SMELL_RANGE;
    if (near && !this.growled) {
      this.growled = true;
      growl(this.ctx.audio, { at: this.at(this.bari.character.position, 0.4) });
      this.smell = { since: 0 };
    }
    if (!this.smell) return;
    this.smell.since += dt;
    if (this.smell.since < SMELL_GRACE) return;
    const stillClose = distanceToPath(this.options.route, player) < SMELL_RANGE;
    this.smell = null;
    if (stillClose) this.searchLeft = SEARCH_TIME;
  }

  private whistle(dt: number): void {
    this.whistleIn -= dt;
    if (this.whistleIn > 0 || this.inside(this.grounds, this.raymond.character.position)) return;
    this.whistleIn = WHISTLE_EVERY + Math.random() * 3;
    playSound(this.ctx.audio, 'sfx_whistle_raymond', { at: this.at(this.raymond.character.position, 1.6) });
  }

  private currentStop(): PatrolStop | null {
    const route = this.raymond.character.currentRoute;
    return route ? (this.options.route[route.currentIndex] ?? null) : null;
  }

  /** Bari trots a little behind and to the left of Raymond. */
  private heelSpot(): Vec2 {
    const r = this.raymond.character;
    return { x: r.position.x + Math.sin(r.yaw) * 0.9 - Math.cos(r.yaw) * 0.6, z: r.position.z + Math.cos(r.yaw) * 0.9 + Math.sin(r.yaw) * 0.6 };
  }

  private inside(zones: ReturnType<typeof zoneShape>[], at: Vec2 = this.ctx.scene.player.position): boolean {
    return zones.some((zone) => containsPoint(zone, at.x, at.z));
  }

  /** Walks the line between two points and asks the collision world whether any of it is solid. */
  private clearSight(from: Vec2, to: Vec2): boolean {
    const length = Math.hypot(to.x - from.x, to.z - from.z);
    const steps = Math.ceil(length / 0.2);
    for (let i = 1; i < steps; i++) {
      const x = MathUtils.lerp(from.x, to.x, i / steps);
      const z = MathUtils.lerp(from.z, to.z, i / steps);
      const free = this.ctx.world.collision.resolve(x, z, 0.01);
      if (Math.abs(free.x - x) + Math.abs(free.z - z) > 1e-6) return false;
    }
    return true;
  }

  /** A sound position `height` meters above the ground at `p`. */
  private at(p: Vec2, height: number) {
    return { x: p.x, y: this.ctx.world.ground.sample(p.x, p.z).height + height, z: p.z };
  }

  private show(on: boolean): void {
    this.raymond.object.visible = on;
    this.bari.object.visible = on;
    this.torch.visible = on;
  }

  private holdTorch(): void {
    const model = this.raymond.character.model;
    model.holding = true;
    const body = new Mesh(new CylinderGeometry(0.035, 0.03, 0.26, 6).rotateX(Math.PI / 2).translate(0, -0.03, -0.1), createPs1Material({ color: 0x141414 }));
    model.hand?.add(body);
  }

  private cast(id: 'raymond' | 'bari'): NpcBuilder {
    const npc = new NpcBuilder(this.ctx, id);
    this.ctx.world.scene.add(npc.object);
    return npc;
  }
}

/** The kit system for a watchman's round: `kit.use(watchmanPatrol({ route, ... }))`. */
export function watchmanPatrol(options: PatrolOptions): (ctx: KitContext) => Patrol {
  return (ctx) => new Patrol(ctx, options);
}
