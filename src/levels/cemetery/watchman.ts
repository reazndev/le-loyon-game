import { Vector3 } from 'three';
import { dialogues } from '../../content';
import { headingOf } from '../../engine/characters/motion';
import { growl, preloadBark } from '../../engine/characters/voices';
import type { Vec2 } from '../../engine/physics/collision';
import type { LevelKit } from '../../game/kit/levelKit';
import { watchmanPatrol, type Patrol, type PatrolStop } from '../../game/patrol/patrol';
import { TorchBeam } from '../../game/patrol/torch';
import type { ScareDirector } from '../../game/scares/director';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { caughtByRaymond } from './caught';
import type { DigSite } from './digSite';
import { CHASSOT_BEDS, chassotGrave, FRONT_GATE, FRONT_Z, GROUNDS, graveByDoc } from './layout';
import { SHED_INSIDE } from './shed';

/** Down the hill outside the front gate, where his rounds start and end, out of sight in the fog. */
const BELOW = { x: 0.4, z: FRONT_Z + 22 };
const FAR_SIDE = { x: 6, z: FRONT_Z + 21 };
const DANIEL = graveByDoc('grave_menoud');

/**
 * Night 1, jumpscare 1. Raymond stopped behind the wall for his thermos, so this once there was
 * no bell and no whistle. Bari barks right behind the reporter, the torch swings onto them, and
 * the old man talks. Then his light goes down the path and the bell fades out.
 */
export class FirstMeeting {
  private readonly raymond;
  private readonly bari;
  private readonly torch: TorchBeam;
  private onPlayer = false;
  private sweep = 0;
  /** True once he has gone back down the hill. */
  gone = false;

  constructor(
    kit: LevelKit,
    private readonly ctx: SceneContext,
  ) {
    this.raymond = kit.npc('raymond').at(BELOW.x, 0, BELOW.z);
    this.bari = kit.npc('bari').at(BELOW.x + 0.8, 0, BELOW.z);
    this.torch = kit.use((k) => {
      const torch = new TorchBeam(k);
      k.later('register', () => k.world.updates.add((dt) => this.aim(dt)));
      return torch;
    });
    this.show(false);
    preloadBark(ctx.audio);
  }

  /** Behind the reporter's back, two meters and four, kept inside the walls. */
  async arrive(): Promise<void> {
    const { player, audio } = this.ctx;
    const back = player.forward().multiplyScalar(-1);
    const spot = (distance: number, side: number): Vec2 => ({
      x: clamp(player.position.x + back.x * distance - back.z * side, GROUNDS.w / 2 - 0.6),
      z: clamp(player.position.z + back.z * distance + back.x * side, GROUNDS.d / 2 - 0.6),
    });
    const dog = spot(2, 0.3);
    const man = spot(3.6, -0.5);
    this.bari.character.position.set(dog.x, 0, dog.z);
    this.raymond.character.position.set(man.x, 0, man.z);
    this.bari.character.face(player.position);
    this.raymond.character.face(player.position);
    this.show(true);
    // Jumpscare 1: the bark right behind, loud, and the frame jolts.
    playSound(audio, 'sfx_bark', { at: { x: dog.x, y: 0.5, z: dog.z }, volume: 3.2 });
    playSound(audio, 'sfx_hit', { at: { x: dog.x, y: 0.8, z: dog.z }, volume: 2 });
    this.ctx.jolt();
    this.onPlayer = true;
    await wait(1.6);
    this.raymond.character.lookAt = player.camera.position;
    await this.ctx.dialogue(dialogues.raymond_night1);
    this.raymond.character.lookAt = null;
    this.onPlayer = false;
    this.bari.character.follow(() => this.raymond.character.position, 0.9);
    await this.raymond.character.walk([{ x: FRONT_GATE.x, z: FRONT_Z - 1 }, { x: FRONT_GATE.x, z: FRONT_Z + 3 }, BELOW], { speed: 0.85 });
    this.show(false);
    this.bari.character.stop();
    this.gone = true;
  }

  private aim(dt: number): void {
    if (!this.torch.object.visible) return;
    this.sweep += dt;
    const r = this.raymond.character;
    const hand = r.model.hand?.getWorldPosition(new Vector3()) ?? r.position.clone().setY(r.position.y + 1.2);
    const target = this.ctx.player.position;
    const yaw = this.onPlayer ? headingOf(target.x - r.position.x, target.z - r.position.z) : r.yaw + 0.35 * Math.sin(this.sweep * 0.9);
    this.torch.aim(hand, yaw, this.onPlayer ? 0.05 : 0.14);
  }

  private show(on: boolean): void {
    this.raymond.object.visible = on;
    this.bari.object.visible = on;
    this.torch.visible = on;
  }
}

export interface NightTwoRound {
  patrol: Patrol;
  /** A shovelful from `at`, heard within `reach` meters. */
  hear(at: Vec2, reach: number): void;
  /** The blade rang on the Gremaud footing: he comes sooner from now on. */
  alarm(): void;
}

/** Seconds offstage between rounds; shorter after a warning or a loud noise. */
const REST = 22;
const REST_ALERT = 6;
/** The round whose stop at the Chassot plot is closer and longer, so the second visit isn't a copy of the first. */
const LINGERING_ROUND = 2;
/** The index of the stop at the Chassot plot in `roundRoute`. */
const PLOT_STOP = 3;

/**
 * One round: bell, whistle, torch, gate, the back row, Daniel's lantern, the gate again. On the
 * lingering round he walks right up to Marc's grave and stands there with Bari sniffing the earth.
 */
function roundRoute(round: number): PatrolStop[] {
  const plot = { x: CHASSOT_BEDS.marc.x, z: CHASSOT_BEDS.marc.z };
  const atPlot: PatrolStop =
    round === LINGERING_ROUND ? { x: plot.x + 2.3, z: chassotGrave.z + 3.4, wait: 10, aim: plot } : { x: -12, z: chassotGrave.z + 3.4, wait: 5, aim: plot };
  return [
    { x: BELOW.x, z: BELOW.z },
    { x: FRONT_GATE.x, z: FRONT_Z + 1, gate: true },
    { x: -0.2, z: chassotGrave.z + 3.4 },
    atPlot,
    { x: -0.2, z: chassotGrave.z + 3.4 },
    { x: -0.3, z: DANIEL.z + 3.5, wait: 3, aim: { x: DANIEL.x - 0.3, z: DANIEL.z + 1.7 } },
    { x: FRONT_GATE.x, z: FRONT_Z + 1, gate: true },
    FAR_SIDE,
  ];
}

/**
 * Night 2, puzzle P5. Raymond's round every minute and a half. The shed and the forest past the
 * back gate are safe; the open hole, a lit torch, or a second sighting end the night.
 */
export function nightTwoRound(kit: LevelKit, ctx: SceneContext, site: DigSite, scares: ScareDirector): NightTwoRound {
  const { state } = ctx;
  const alert = () => state.hasFlag('raymond_warned') || state.hasFlag('dug_gremaud_stone');
  const plot = { x: CHASSOT_BEDS.marc.x, z: CHASSOT_BEDS.marc.z };
  // The patrol walks this array each round, so each round's stops are copied into it as the round starts.
  const route = roundRoute(1);
  let round = 0;
  const patrol = kit
    .use(
      watchmanPatrol({
        route,
        rest: alert() ? REST_ALERT : REST,
        firstIn: alert() ? 15 : 35,
        speed: 1,
        grounds: [GROUNDS],
        safe: [SHED_INSIDE],
        evidence: [{ at: plot, active: () => site.visible }],
      }),
    )
    .onRound(() => {
      round += 1;
      route.splice(0, route.length, ...roundRoute(round));
      scares.block(50);
    })
    .onCaught(() => void caughtByRaymond(ctx))
    .onSeen(async () => {
      // A second sighting, the reporter in or at the open hole, or caught with the shovel.
      if (state.hasFlag('raymond_warned') || site.holding || site.inHole || site.visible) return patrol.catch('beam');
      await ctx.dialogue(dialogues.raymond_night2_warn);
      ctx.goTo('cemetery_path', 'from_cemetery');
    });
  patrol.raymond.character.events.on('arrive', (index) => {
    if (round !== LINGERING_ROUND || index !== PLOT_STOP || patrol.caught) return;
    const dog = patrol.bari.character.position;
    growl(ctx.audio, { at: { x: dog.x, y: 0.4, z: dog.z } });
  });
  const walking = () => patrol.raymond.object.visible && !patrol.caught;
  return {
    patrol,
    hear: (at, reach) => {
      if (walking() && patrol.raymond.character.position.distanceTo(new Vector3(at.x, 0, at.z)) < reach) patrol.catch('beam');
    },
    alarm: () => {
      patrol.hurry(30);
      patrol.rest = REST_ALERT;
    },
  };
}

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
