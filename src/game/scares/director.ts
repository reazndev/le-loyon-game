import { Vector3 } from 'three';
import type { Point3 } from '../../engine/audio/audioManager';
import type { Surface } from '../../engine/physics/ground';
import { ps1Uniforms } from '../../engine/render/ps1Uniforms';
import type { KitContext } from '../kit/builders';
import { NpcBuilder } from '../kit/npc';
import { BeatTracker, viewAngle, type Beat, type FigureSpec, type Place, type ScareAction, type Senses } from './beats';
import { Figure, type Viewer } from './figure';
import { RandomEvents, type RandomEventId, type RandomEventOptions } from './randomEvents';
import { otherStep, playSound } from './sounds';

export interface DirectorOptions {
  /** Random sound events between beats, for outdoor night scenes and the bunker. */
  random?: RandomEventOptions & { surface?: Surface };
}

const SILENCE_FADE = 1.5;
const SILENCE_RETURN = 3;
/** Fixed beats keep random events away for this long. */
const AFTER_BEAT = 60;

interface Timer {
  at: number;
  run: () => void;
}

/**
 * Stages the beats of docs/script/07-scares.md in one scene. Levels describe beats as data and
 * hand them over with `kit.use(scareDirector(beats))`; see docs/characters.md.
 */
export class ScareDirector {
  private readonly tracker: BeatTracker;
  private readonly random: RandomEvents | null;
  private readonly figures = new Map<FigureSpec, NpcBuilder>();
  private running: Figure[] = [];
  private timers: Timer[] = [];
  private clock = 0;
  private fogRestore: (() => void) | null = null;
  private readonly view = new Vector3();

  constructor(
    private readonly ctx: KitContext,
    private readonly beats: Beat[],
    private readonly options: DirectorOptions = {},
  ) {
    this.tracker = new BeatTracker(beats);
    this.random = options.random ? new RandomEvents(options.random) : null;
    beats.flatMap((beat) => beat.do).forEach((action) => {
      if ('figure' in action) this.figures.set(action.figure, this.castFigure(action.figure));
    });
    ctx.later('register', () => ctx.world.updates.add((dt) => this.update(dt)));
  }

  /** Fires a beat by id now, whatever its triggers say. */
  fire(id: string): void {
    const beat = this.beats.find((b) => b.id === id);
    if (beat) this.play(beat);
  }

  /** Keeps random events away for `seconds`, for example while the watchman approaches. */
  block(seconds: number): void {
    this.random?.block(seconds);
  }

  private update(dt: number): void {
    const scene = this.ctx.scene;
    if (scene.paused) return;
    this.clock += dt;
    this.timers.filter((t) => t.at <= this.clock).forEach((t) => t.run());
    this.timers = this.timers.filter((t) => t.at > this.clock);

    const senses = this.senses();
    this.tracker.update(senses, dt).forEach((beat) => this.play(beat));
    const viewer = this.viewer();
    this.running.forEach((figure) => figure.update(dt, viewer));
    this.running = this.running.filter((figure) => !figure.done);

    const event = this.random?.update(dt);
    if (event) this.playRandom(event);
  }

  private play(beat: Beat): void {
    if (beat.set) this.ctx.scene.state.setFlag(beat.set);
    this.random?.block(AFTER_BEAT);
    beat.do.forEach((action) => this.after(action.after ?? 0, () => this.perform(action)));
  }

  private perform(action: ScareAction): void {
    const { audio, scene } = this.ctx;
    if ('figure' in action) {
      const figure = new Figure(this.figures.get(action.figure)!.character, action.figure);
      this.running.push(figure);
    } else if ('sound' in action) {
      playSound(audio, action.sound, { at: this.place(action.at ?? 'behind', action.distance ?? 12), ...(action.volume ? { volume: action.volume } : {}) });
    } else if ('stalk' in action) {
      this.stalk(action.stalk.surface ?? 'gravel', action.stalk.steps ?? 10, action.stalk.distance ?? 7);
    } else if ('silence' in action) {
      this.silence(action.silence);
    } else if ('fog' in action) {
      this.thickenFog(action.fog);
    } else if ('stinger' in action) {
      const at = this.place(action.at ?? 'behind', 2);
      playSound(audio, action.stinger === true ? 'sfx_hit' : action.stinger, { at, volume: 2 });
    } else {
      void action.run(scene);
    }
  }

  private playRandom(event: RandomEventId): void {
    const surface = this.options.random?.surface ?? 'gravel';
    const side = (['behind', 'left', 'right'] as const)[Math.floor(Math.random() * 3)]!;
    if (event === 'step') this.stalk(surface, 2 + Math.floor(Math.random() * 3), 6 + Math.random() * 4);
    else if (event === 'branch') playSound(this.ctx.audio, 'sfx_branch', { at: this.place(side, 15 + Math.random() * 15) });
    else if (event === 'silence') this.silence(8);
    else playSound(this.ctx.audio, 'sfx_breath_mask', { at: this.place(side, 9), volume: 0.4 });
  }

  /** Footsteps that answer the player's own, one step late, from `distance` meters behind. */
  private stalk(surface: Surface, steps: number, distance: number): void {
    let left = steps;
    const stop = this.ctx.scene.player.events.on('footstep', () => {
      const at = this.place('behind', distance);
      const drag = left % 2 === 0;
      this.after(0.32 + Math.random() * 0.06, () => otherStep(this.ctx.audio, surface, at, drag));
      if (--left <= 0) stop();
    });
  }

  private silence(seconds: number): void {
    const { audio } = this.ctx;
    audio.fadeBus('ambience', 0, SILENCE_FADE);
    this.after(SILENCE_FADE + seconds, () => audio.fadeBus('ambience', audio.busLevel('ambience'), SILENCE_RETURN));
  }

  private thickenFog(fog: { far?: number; density?: number; seconds: number; fade?: number }): void {
    this.fogRestore?.();
    const base = { far: ps1Uniforms.uFogFar.value, density: ps1Uniforms.uFogDensity.value };
    const goal = { far: fog.far ?? base.far * 0.6, density: fog.density ?? base.density * 1.8 };
    const fade = fog.fade ?? 4;
    const start = this.clock;
    const end = start + fade * 2 + fog.seconds;
    const ease = (k: number) => k * k * (3 - 2 * k);
    const tick = () => {
      const t = this.clock - start;
      const k = ease(Math.min(1, t / fade, Math.max(0, (end - this.clock) / fade)));
      ps1Uniforms.uFogFar.value = base.far + (goal.far - base.far) * k;
      ps1Uniforms.uFogDensity.value = base.density + (goal.density - base.density) * k;
    };
    this.ctx.world.updates.add(tick);
    this.fogRestore = () => {
      this.ctx.world.updates.delete(tick);
      ps1Uniforms.uFogFar.value = base.far;
      ps1Uniforms.uFogDensity.value = base.density;
      this.fogRestore = null;
    };
    this.after(end - start, () => this.fogRestore?.());
  }

  private after(seconds: number, run: () => void): void {
    if (seconds <= 0) run();
    else this.timers.push({ at: this.clock + seconds, run });
  }

  /** A point `distance` meters from the player in a direction relative to their facing. */
  private place(place: Place, distance: number): Point3 {
    const player = this.ctx.scene.player;
    if (typeof place !== 'string') return { x: place.x, y: player.position.y + 1, z: place.z };
    const forward = player.forward();
    const [ax, az] = { ahead: [1, 0], behind: [-1, 0], left: [0, 1], right: [0, -1] }[place];
    // Left of a heading (fx, fz) is (fz, -fx) in this yaw convention.
    const dx = forward.x * ax! + forward.z * az!;
    const dz = forward.z * ax! - forward.x * az!;
    return { x: player.position.x + dx * distance, y: player.position.y + 1, z: player.position.z + dz * distance };
  }

  private senses(): Senses {
    const { player, state, time } = this.ctx.scene;
    const eye = player.camera.position;
    player.camera.getWorldDirection(this.view);
    return { x: player.position.x, z: player.position.z, eye, view: this.view, time, state };
  }

  private viewer(): Viewer {
    const eye = this.ctx.scene.player.camera.position;
    const view = this.view;
    return { eye, angleTo: (point) => viewAngle({ eye, view }, point), sight: ps1Uniforms.uFogFar.value * 1.1 };
  }

  private castFigure(spec: FigureSpec): NpcBuilder {
    const npc = new NpcBuilder(this.ctx, spec.who ?? 'marc');
    npc.object.visible = false;
    this.ctx.world.scene.add(npc.object);
    return npc;
  }
}

/** The kit system that builds a director: `const scares = kit.use(scareDirector(beats))`. */
export function scareDirector(beats: Beat[], options: DirectorOptions = {}): (ctx: KitContext) => ScareDirector {
  return (ctx) => new ScareDirector(ctx, beats, options);
}
