import { MathUtils, type Object3D } from 'three';
import { playerTuning } from '../../engine/player';
import { dialogues, type StoryFlag } from '../../content';
import type { BoxShape, Vec2 } from '../../engine/physics/collision';
import type { DialogueScript } from '../../game/dialogue';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode, readDocument } from '../forest_path/play';
import {
  boxInCoffin,
  CLIMB_IN_SECONDS,
  CLIMB_OUT_SECONDS,
  DIG_STAGES,
  digNode,
  graveAction,
  holeDepth,
  holeOpen,
  IN_HOLE_STAGE,
  REFILL_STAGES,
  refillNode,
  StageClock,
  stageSeconds,
  type GraveAction,
} from './dig';
import { bedFill } from './graves';
import { CHASSOT_BEDS, GRAVE_FOOT, WEST_X } from './layout';
import { TARP_IN_SHED } from './shed';
import { earthFall, lidCrack, shovelStroke } from './sounds';

const HOLE = CHASSOT_BEDS.marc;
const MAX_DEPTH = 2.1;
const COFFIN = { w: 0.56, d: 1.8, h: 0.38 };
/** The reporter stands at the foot end of the hole; the coffin lies in the rest. */
const STAND = { x: HOLE.x, z: HOLE.z + HOLE.d / 2 - 0.22 };
const COFFIN_Z = HOLE.z - HOLE.d / 2 + COFFIN.d / 2 + 0.05;
const TARP_BESIDE = { x: GRAVE_FOOT.x - 0.95, z: GRAVE_FOOT.z + 0.3 };
const STROKE_EVERY = 1.7;
/** How far the sound of the shovel carries to Raymond, digging and refilling. */
export const DIG_REACH = 20;
export const REFILL_REACH = 12;
/** Looking down at the lid from inside the hole. */
const COFFIN_PITCH = -0.85;
/** A transient flag the confirm dialogue sets on "Dig.", read and cleared at once. */
const CONFIRMED: StoryFlag = 'dig_confirmed';

type Tarp = 'shed' | 'beside' | 'over';

export interface DigHooks {
  /** Each shovelful, from the hole, heard within `reach` meters. */
  noise(at: Vec2, reach: number): void;
  /** After a dig stage's narration. */
  stageDone(stage: number): void;
  /** After the box is out and the letter read, at the graveside. */
  letterRead(): void;
  /** The first time the reporter climbs out after taking the box. */
  outAfterBox(): void;
}

/**
 * Marc's side of the Chassot plot and everything puzzle P5 does there: digging in held stages,
 * the hole and the earth pile growing, climbing in and out, the tarp, the coffin, the box, and
 * the refill. `inHole` and `holding` tell the patrol rules what the reporter is doing.
 */
export class DigSite {
  inHole = false;
  holding: 'dig' | 'refill' | null = null;
  tarp: Tarp;
  private readonly clock = new StageClock(stageSeconds('dig'));
  private clockMode: 'dig' | 'refill' = 'dig';
  private strokeIn = 0;
  private stroke = 0;
  private climb: { from: Vec2 & { y: number }; to: Vec2 & { y: number }; t: number; seconds: number; into: boolean } | null = null;
  private pitch = 0;
  private outAfterBoxDone = false;
  /** Said "Dig." at the first stroke; asked once per visit. */
  private confirmed = false;
  private removeColliders: (() => void)[] = [];
  private colliders: 'none' | 'solid' | 'edges' = 'none';
  private readonly parts: Record<'bed' | 'hole' | 'floorNorth' | 'floorSouth' | 'coffin' | 'lid' | 'box' | 'pile' | 'tarpBeside' | 'tarpOver' | 'tarpShed' | 'boards', Object3D>;

  constructor(
    kit: LevelKit,
    private readonly ctx: SceneContext,
    private readonly hooks: DigHooks,
    leftOpenByDay: boolean,
  ) {
    const { state } = ctx;
    this.tarp = state.hasFlag('tarp_over_hole') && holeOpen(state) ? 'over' : 'shed';
    this.parts = this.build(kit, leftOpenByDay);
    kit.use((k) => {
      k.world.ground.add({ area: this.shape(), heightAt: () => (holeOpen(state) ? -holeDepth(state) : 0.06), surface: 'gravel' });
      k.later('register', () => k.world.updates.add((dt) => this.update(dt)));
      this.syncColliders = () => {
        const want = this.inHole ? 'edges' : holeOpen(state) ? 'solid' : 'none';
        if (want === this.colliders) return;
        this.colliders = want;
        this.removeColliders.splice(0).forEach((remove) => remove());
        // In the hole, four walls just outside its edges keep the reporter in and hide them crouched.
        const shapes = want === 'solid' ? [this.shape(0.05)] : want === 'edges' ? edges() : [];
        this.removeColliders = shapes.map((shape) => k.world.collision.add(shape));
      };
    });

    kit
      .hotspot({ prompt: () => this.prompt(), enabled: () => this.prompt() !== '', radius: 0.9, onInteract: () => this.interact() })
      .at(HOLE.x, 0, HOLE.z);
    kit
      .hotspot({
        prompt: () => (this.tarp === 'over' ? 'Pull the tarp back' : 'Pull the tarp over the hole'),
        enabled: () => !this.inHole && !this.climb && holeOpen(state) && this.tarp !== 'shed' && !leftOpenByDay,
        radius: 0.45,
        onInteract: () => this.setTarp(this.tarp === 'over' ? 'beside' : 'over'),
      })
      .at(TARP_BESIDE.x, 0, TARP_BESIDE.z);
    kit
      .hotspot({
        prompt: () => (holeOpen(state) ? 'Drag the tarp to the grave' : 'Look at the tarp'),
        enabled: () => this.tarp === 'shed' && !state.hasFlag('grave_refilled'),
        radius: 0.4,
        onInteract: async () => {
          await ctx.say('A green tarp, folded. Raymond covers fresh graves with it when it rains.');
          if (holeOpen(state)) this.setTarp('beside');
        },
      })
      .at(TARP_IN_SHED.x, 0, TARP_IN_SHED.z);
    this.refresh();
    this.opened = state.hasFlag('opened_coffin');
  }

  private opened: boolean;

  private syncColliders: () => void = () => undefined;

  /** The hole is open and Raymond's torch would find it. */
  get visible(): boolean {
    return holeOpen(this.ctx.state) && this.tarp !== 'over';
  }

  private shape(margin = 0): BoxShape {
    return { kind: 'box', x: HOLE.x, z: HOLE.z, hw: HOLE.w / 2 + margin, hd: HOLE.d / 2 + margin, angle: 0 };
  }

  private action(): GraveAction {
    return this.climb ? null : graveAction(this.ctx.state, this.inHole);
  }

  private prompt(): string {
    if (this.tarp === 'over') return '';
    switch (this.action()) {
      case 'dig':
        return 'Dig';
      case 'refill':
        return 'Fill in the grave';
      case 'climb_in':
        return 'Climb down';
      case 'lift_lid':
        return 'Look at the lid';
      case 'take_box':
        return 'Take the box';
      default:
        return '';
    }
  }

  private async interact(): Promise<void> {
    const action = this.action();
    const { state } = this.ctx;
    if (action === 'climb_in') return this.startClimb(true);
    if (action === 'lift_lid') {
      await this.ctx.dialogue(dialogues.coffin_lid);
      return this.refresh();
    }
    if (action === 'take_box') {
      await playNode(this.ctx, 'coffin_box');
      this.refresh();
      await readDocument(this.ctx, 'doc_gremaud_letter');
      this.hooks.letterRead();
      return;
    }
    if (action !== 'dig' && action !== 'refill') return;
    if (action === 'dig' && state.count('dig_stage') === 0 && !this.confirmed) {
      this.confirmed = await this.confirm();
      return;
    }
    if (this.clockMode !== action) this.clock.reset(stageSeconds(action));
    this.clockMode = action;
    this.holding = action;
    this.strokeIn = 0.4;
  }

  /** "If I'm wrong about this, there's no explaining it to anyone." Dig, or not yet. */
  private async confirm(): Promise<boolean> {
    const nodes = dialogues.dig_chassot_start.nodes;
    const script: DialogueScript = {
      start: 'dig_chassot_start',
      nodes: {
        ...nodes,
        dig_chassot_start: {
          ...nodes.dig_chassot_start!,
          choices: [
            { text: 'Dig.', effects: { set: CONFIRMED } },
            { text: 'Not yet.', next: 'dig_not_yet' },
          ],
        },
      },
    };
    await this.ctx.dialogue(script);
    const confirmed = this.ctx.state.hasFlag(CONFIRMED);
    this.ctx.state.setFlag(CONFIRMED, false);
    return confirmed;
  }

  private setTarp(tarp: Tarp): void {
    this.tarp = tarp;
    this.ctx.state.setFlag('tarp_over_hole', tarp === 'over');
    this.refresh();
  }

  private startClimb(into: boolean): void {
    const p = this.ctx.player.position;
    const depth = holeDepth(this.ctx.state);
    this.holding = null;
    this.climb = {
      from: { x: p.x, y: p.y, z: p.z },
      to: into ? { ...STAND, y: -depth } : { ...GRAVE_FOOT, y: 0 },
      t: 0,
      seconds: into ? CLIMB_IN_SECONDS : depth >= 0.9 ? CLIMB_OUT_SECONDS : CLIMB_IN_SECONDS,
      into,
    };
    if (into) this.inHole = true;
    else this.ctx.player.crouched = false;
    this.syncColliders();
  }

  private update(dt: number): void {
    const { ctx } = this;
    // The lid comes up while the narration of the empty coffin is still on screen.
    if (!this.opened && ctx.state.hasFlag('opened_coffin')) {
      this.opened = true;
      lidCrack(ctx.audio, { x: HOLE.x, y: -1.5, z: COFFIN_Z });
      this.refresh();
    }
    if (this.climb) this.updateClimb(dt);
    else if (this.inHole) {
      ctx.player.position.x = STAND.x;
      ctx.player.position.z = STAND.z;
      if (!ctx.paused && (ctx.held('up') || ctx.held('down'))) this.startClimb(false);
    }
    if (this.holding && !ctx.paused) this.updateHolding(dt);
    this.updateView(dt);
  }

  private updateClimb(dt: number): void {
    const climb = this.climb!;
    climb.t = Math.min(1, climb.t + dt / climb.seconds);
    const e = climb.t * climb.t * (3 - 2 * climb.t);
    const p = this.ctx.player.position;
    p.x = MathUtils.lerp(climb.from.x, climb.to.x, e);
    p.z = MathUtils.lerp(climb.from.z, climb.to.z, e);
    // Out of the hole the body comes up first, then forward; into it, forward then down.
    const lift = climb.into ? Math.max(0, (e - 0.3) / 0.7) : Math.min(1, e / 0.7);
    p.y = MathUtils.lerp(climb.from.y, climb.to.y, lift);
    if (climb.t < 1) return;
    this.climb = null;
    if (climb.into) return;
    this.inHole = false;
    this.syncColliders();
    if (!this.outAfterBoxDone && this.ctx.state.hasItem('bunker_key') && this.ctx.state.hasFlag('opened_coffin')) {
      this.outAfterBoxDone = true;
      this.hooks.outAfterBox();
    }
  }

  private updateHolding(dt: number): void {
    const { ctx } = this;
    const mode = this.holding!;
    const p = ctx.player.position;
    const near = this.inHole || Math.hypot(p.x - HOLE.x, p.z - HOLE.z) < 2.3;
    if (!ctx.held('interact') || !near || this.action() !== mode) {
      this.holding = null;
      return;
    }
    this.stroke += dt;
    this.strokeIn -= dt;
    if (this.strokeIn <= 0) {
      this.strokeIn = STROKE_EVERY * (0.9 + Math.random() * 0.2);
      const at = { x: HOLE.x, y: -holeDepth(ctx.state) * 0.5 + 0.2, z: HOLE.z };
      // In the dark every sound is louder.
      if (mode === 'dig') shovelStroke(ctx.audio, at, ctx.player.crouched ? 0.8 : 1);
      else earthFall(ctx.audio, at, ctx.state.count('refill_stage') === 0);
      this.hooks.noise(HOLE, mode === 'dig' ? DIG_REACH : REFILL_REACH);
      this.growPile();
    }
    if (this.clock.hold(dt)) void this.finishStage(mode);
  }

  private async finishStage(mode: 'dig' | 'refill'): Promise<void> {
    const { ctx } = this;
    this.holding = null;
    if (mode === 'dig') {
      const stage = Math.min(ctx.state.count('dig_stage') + 1, DIG_STAGES);
      await playNode(ctx, digNode(stage));
      this.refresh();
      // From waist deep on, the reporter is down in the hole.
      if (stage === IN_HOLE_STAGE && !this.inHole) this.startClimb(true);
      this.hooks.stageDone(stage);
    } else {
      const stage = Math.min(ctx.state.count('refill_stage') + 1, REFILL_STAGES);
      await playNode(ctx, refillNode(stage));
      this.refresh();
    }
  }

  private updateView(dt: number): void {
    const { ctx } = this;
    const lookingDown = this.inHole && ctx.state.count('dig_stage') >= DIG_STAGES && !this.climb && boxInCoffinOrClosed(ctx);
    this.pitch = MathUtils.damp(this.pitch, lookingDown ? COFFIN_PITCH : 0, 3, dt);
    const dip = this.holding ? -0.12 * Math.max(0, Math.sin((this.stroke / STROKE_EVERY) * Math.PI * 2)) : 0;
    if (Math.abs(this.pitch) < 0.001 && dip === 0) return;
    ctx.player.camera.rotation.x = MathUtils.degToRad(playerTuning.pitchDeg) + this.pitch + dip;
  }

  private growPile(): void {
    const { state } = this.ctx;
    const dug = state.count('dig_stage') + this.clock.progress * (this.holding === 'dig' ? 1 : 0);
    const back = state.count('refill_stage') + this.clock.progress * (this.holding === 'refill' ? 1 : 0);
    this.scalePile(Math.max(0, dug - back * (DIG_STAGES / REFILL_STAGES)));
  }

  private scalePile(amount: number): void {
    const pile = this.parts.pile;
    pile.visible = amount > 0.05;
    pile.scale.set(0.55 + amount * 0.09, Math.max(0.01, amount * 0.11), 0.55 + amount * 0.12);
  }

  /** Shows the parts that match the story state. */
  private refresh(): void {
    const { state } = this.ctx;
    const open = holeOpen(state);
    const depth = holeDepth(state);
    const stage = state.count('dig_stage');
    const coffinShown = open && (stage >= DIG_STAGES || state.hasFlag('opened_coffin')) && state.count('refill_stage') === 0;
    const p = this.parts;
    p.bed.visible = !open;
    p.hole.visible = open;
    p.floorSouth.visible = open;
    p.floorSouth.position.y = -depth;
    p.floorNorth.visible = open && !coffinShown;
    p.floorNorth.position.y = -depth;
    p.coffin.visible = coffinShown;
    p.lid.visible = coffinShown || (open && state.count('refill_stage') === 1);
    p.lid.position.set(...(state.hasFlag('opened_coffin') && state.count('refill_stage') === 0 ? LID_ASIDE : LID_ON));
    p.lid.rotation.z = state.hasFlag('opened_coffin') && state.count('refill_stage') === 0 ? 1.25 : 0;
    p.box.visible = coffinShown && boxInCoffin(state);
    p.tarpShed.visible = this.tarp === 'shed';
    p.tarpBeside.visible = this.tarp === 'beside';
    p.tarpOver.visible = this.tarp === 'over' && open;
    if (state.hasFlag('grave_refilled')) p.bed.position.y = -0.03;
    this.scalePile(Math.max(0, stage - state.count('refill_stage') * (DIG_STAGES / REFILL_STAGES)));
    this.syncColliders();
  }

  private build(kit: LevelKit, leftOpenByDay: boolean): DigSite['parts'] {
    const earth = 0x4e4238;
    const bed = kit.group((g) => {
      bedFill(g, { ...HOLE, x: 0, z: 0 }, 'gravel', false);
      // The dead geranium in its pot.
      g.cylinder({ r: 0.09, h: 0.13, sides: 6 }).color(0x7a4a36).at(0.15, 0.06, -0.55);
      g.sprite('grass_tuft', { w: 0.28, h: 0.22 }).color(0x5a4a3a).at(0.15, 0.19, -0.55);
    }).at(HOLE.x, 0, HOLE.z).object;

    const hole = kit.group((g) => {
      const wall = (w: number, d: number, x: number, z: number) =>
        g.box({ w, h: MAX_DEPTH, d, cell: 0.5 }).texture('grave_dirt', { tile: 1.2 }).color(earth).at(x, -MAX_DEPTH, z).doubleSided();
      wall(HOLE.w, 0.04, 0, -HOLE.d / 2);
      wall(HOLE.w, 0.04, 0, HOLE.d / 2);
      wall(0.04, HOLE.d, -HOLE.w / 2, 0);
      wall(0.04, HOLE.d, HOLE.w / 2, 0);
    }).at(HOLE.x, 0, HOLE.z).object;
    const southD = HOLE.d - COFFIN.d - 0.05;
    const floorSouth = kit.plane({ w: HOLE.w, d: southD, cell: 0.4 }).texture('grave_dirt', { tile: 1 }).color(0x564a3e).at(HOLE.x, 0, HOLE.z + HOLE.d / 2 - southD / 2).object;
    const floorNorth = kit.plane({ w: HOLE.w, d: HOLE.d - southD, cell: 0.4 }).texture('grave_dirt', { tile: 1 }).color(0x564a3e).at(HOLE.x, 0, COFFIN_Z).object;

    const coffin = kit.group((g) => {
      const pine = 0xb4a486;
      const side = (w: number, d: number, x: number, z: number) => g.box({ w, h: COFFIN.h, d }).texture('wood_planks', { tile: 0.8 }).color(pine).at(x, -COFFIN.h, z);
      side(COFFIN.w, 0.04, 0, -COFFIN.d / 2);
      side(COFFIN.w, 0.04, 0, COFFIN.d / 2);
      side(0.04, COFFIN.d, -COFFIN.w / 2, 0);
      side(0.04, COFFIN.d, COFFIN.w / 2, 0);
      // Grey satin lining, stained and sagging, and nothing else.
      g.plane({ w: COFFIN.w - 0.06, d: COFFIN.d - 0.06, cell: 0.3 }).texture('tiles_white', { tile: 0.9 }).color(0x7c7a76).at(0, -COFFIN.h + 0.03, 0);
      g.plane({ w: 0.2, d: 0.5 }).color(0x5a5248).at(-0.1, -COFFIN.h + 0.035, 0.4);
      // The earth around the coffin, at the level of its top.
      const strip = (HOLE.w - COFFIN.w) / 2;
      [-1, 1].forEach((side) =>
        g.plane({ w: strip, d: COFFIN.d + 0.1, cell: 0.4 }).texture('grave_dirt').color(0x564a3e).at(side * (COFFIN.w + strip) / 2, 0, 0),
      );
      g.plane({ w: HOLE.w, d: 0.06 }).texture('grave_dirt').color(0x564a3e).at(0, 0, -COFFIN.d / 2 - 0.04);
    }).at(HOLE.x, -1.6, COFFIN_Z).object;
    const lid = kit.box({ w: COFFIN.w, h: 0.04, d: COFFIN.d }).texture('wood_planks', { tile: 0.8 }).color(0xa89878).object;
    const box = kit.box({ w: 0.26, h: 0.1, d: 0.18 }).texture('rust_metal', { tile: 0.4 }).color(0x7a7e80).at(HOLE.x, -1.6 - COFFIN.h + 0.04, COFFIN_Z).object;

    const pile = kit.cylinder({ r: 1, h: 1, sides: 6 }).texture('grave_dirt', { tile: 0.8 }).color(earth).at((WEST_X + HOLE.x - HOLE.w / 2) / 2 + 0.05, 0, HOLE.z - 0.2).object;

    const tarpShed = kit.box({ w: 0.62, h: 0.16, d: 0.46 }).texture('mud', { tile: 0.5 }).color(0x3c5236).at(TARP_IN_SHED.x, 0.03, TARP_IN_SHED.z).object;
    const tarpBeside = kit.box({ w: 0.62, h: 0.16, d: 0.46 }).texture('mud', { tile: 0.5 }).color(0x3c5236).at(TARP_BESIDE.x, 0.02, TARP_BESIDE.z).rotY(20).object;
    const tarpOver = kit.box({ w: HOLE.w + 0.5, h: 0.03, d: HOLE.d + 0.45 }).texture('mud', { tile: 1 }).color(0x3a5034).at(HOLE.x, 0.07, HOLE.z).object;

    // Day 3, if the grave was left open: boards over the hole and red and white tape on four stakes.
    const boards = kit.group((g) => {
      [-0.7, 0, 0.7].forEach((z) => g.box({ w: HOLE.w + 0.5, h: 0.05, d: 0.28 }).texture('wood_planks', { tile: 1 }).color(0x7a6e5e).at(0, 0.02, z));
      const corners = [
        [-1, -1.6],
        [1, -1.6],
        [1, 1.6],
        [-1, 1.6],
      ] as const;
      corners.forEach(([x, z]) => g.box({ w: 0.05, h: 0.85, d: 0.05 }).color(0x8a7a5e).at(x, 0, z));
      corners.forEach(([x, z], i) => {
        const [nx, nz] = corners[(i + 1) % 4]!;
        const length = Math.hypot(nx - x, nz - z);
        g.box({ w: length, h: 0.05, d: 0.01 })
          .color(i % 2 ? 0xb8b4aa : 0x9a3a32)
          .at((x + nx) / 2, 0.7, (z + nz) / 2)
          .rotY(nx === x ? 90 : 0);
      });
    }).at(HOLE.x + 0.15, 0, HOLE.z).object;
    boards.visible = leftOpenByDay;
    if (leftOpenByDay) {
      kit
        .hotspot({ prompt: 'Look at the grave', radius: 0.8, onInteract: () => this.ctx.say('Boards over the hole. Red and white tape on four stakes. Nobody has touched the pile of earth.') })
        .at(HOLE.x, 0, HOLE.z + 1.4);
    }

    return { bed, hole, floorNorth, floorSouth, coffin, lid, box, pile, tarpBeside, tarpOver, tarpShed, boards };
  }
}

/** Thin walls just outside the hole's four edges. */
function edges(): BoxShape[] {
  const t = 0.1;
  const box = (x: number, z: number, hw: number, hd: number): BoxShape => ({ kind: 'box', x, z, hw, hd, angle: 0 });
  return [
    box(HOLE.x, HOLE.z - HOLE.d / 2 - t, HOLE.w / 2 + 2 * t, t),
    box(HOLE.x, HOLE.z + HOLE.d / 2 + t, HOLE.w / 2 + 2 * t, t),
    box(HOLE.x - HOLE.w / 2 - t, HOLE.z, t, HOLE.d / 2),
    box(HOLE.x + HOLE.w / 2 + t, HOLE.z, t, HOLE.d / 2),
  ];
}

const LID_ON: [number, number, number] = [HOLE.x, -1.6, COFFIN_Z];
const LID_ASIDE: [number, number, number] = [HOLE.x + HOLE.w / 2 - 0.12, -1.2, COFFIN_Z];

const boxInCoffinOrClosed = (ctx: SceneContext) => !ctx.state.hasFlag('opened_coffin') || boxInCoffin(ctx.state);
