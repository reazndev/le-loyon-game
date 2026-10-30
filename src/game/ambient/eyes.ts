import { MathUtils, Vector3, type Object3D } from 'three';
import { ps1Uniforms } from '../../engine/render/ps1Uniforms';
import type { LevelKit } from '../kit/levelKit';
import { fogSight, liveFog } from '../scares/fogSight';
import { startleAt } from '../scares/startles';
import type { SceneContext } from '../scene';
import { critters, type Runner } from './critters';
import { everyFrame, nowAndThen } from './schedule';

export interface EyesOptions {
  /** Average seconds between pairs of eyes. Default 60. */
  every?: number;
}

/** How each animal's eyes look in a torch beam: height off the ground, gap, size, and shine. */
const ANIMALS: Record<Runner, { height: number; gap: number; size: number; shine: number }> = {
  deer: { height: 1.5, gap: 0.14, size: 0.05, shine: 0xc8e4b0 },
  fox: { height: 0.45, gap: 0.08, size: 0.04, shine: 0xdcd478 },
  hare: { height: 0.3, gap: 0.07, size: 0.035, shine: 0xd08a5a },
};
const KINDS = Object.keys(ANIMALS) as Runner[];
/** Degrees off the beam's center that still count as in its light: inside the torch's cone. */
const IN_BEAM = 12;
/** Degrees either side of the beam's center the eyes can appear at. */
const SPREAD = 7;

interface Shine {
  kind: Runner;
  eyes: Object3D;
  /** Seconds lit so far, how long they stay lit, and seconds since they appeared. */
  lit: number;
  hold: number;
  age: number;
}

const toPoint = new Vector3();

/** Whether the torch is lighting `point` now: it is on, not dropped out, and pointed at it. */
function inBeam(point: Vector3): boolean {
  const lit = ps1Uniforms.uSpotColor.value.r > 0.05;
  toPoint.copy(point).sub(ps1Uniforms.uSpotPos.value);
  return lit && MathUtils.radToDeg(toPoint.angleTo(ps1Uniforms.uSpotDir.value)) <= IN_BEAM;
}

/**
 * Eyes in the torch beam at night: now and then a pair of small lights shows 10 to 20 m off in
 * the beam, at the height of a deer's, a fox's, or a hare's eyes. They stay a second or three
 * while the torch is on them, then go out, or the animal bolts from the spot.
 */
export function eyesInBeam(kit: LevelKit, ctx: SceneContext, options: EyesOptions = {}): void {
  if (ctx.state.time !== 'night') return;
  const world = kit.use((k) => k.world);
  const pool = kit.use(critters);
  const pairs = Object.fromEntries(
    KINDS.map((kind) => {
      const { gap, size, shine } = ANIMALS[kind];
      const placed = kit
        .group((g) => [-gap / 2, gap / 2].forEach((x) => g.box({ w: size, h: size * 0.7, d: size }).color(0x000000).emissive(shine).at(x, 0, 0)))
        .dynamic();
      placed.object.visible = false;
      return [kind, placed.object];
    }),
  ) as Record<Runner, Object3D>;
  let shine: Shine | null = null;

  nowAndThen(kit, ctx, options.every ?? 60, () => {
    if (shine) return;
    const kind = KINDS[Math.floor(Math.random() * KINDS.length)]!;
    const beam = ps1Uniforms.uSpotDir.value;
    const angle = Math.atan2(beam.x, beam.z) + MathUtils.degToRad((Math.random() * 2 - 1) * SPREAD);
    const distance = Math.min(10 + Math.random() * 10, fogSight(liveFog()) * 0.7);
    const p = ctx.player.position;
    const x = p.x + Math.sin(angle) * distance;
    const z = p.z + Math.cos(angle) * distance;
    const eyes = pairs[kind];
    eyes.position.set(x, world.ground.sample(x, z).height + ANIMALS[kind].height, z);
    // Turned to the player, so the pair lies across the view.
    eyes.rotation.y = Math.atan2(p.x - x, p.z - z);
    if (!inBeam(eyes.position)) return;
    shine = { kind, eyes, lit: 0, hold: 1 + Math.random() * 2, age: 0 };
  });

  everyFrame(kit, (dt) => {
    if (!shine || ctx.paused) return;
    const lit = inBeam(shine.eyes.position);
    shine.eyes.visible = lit;
    shine.age += dt;
    if (lit) shine.lit += dt;
    // Gone once it has been lit long enough, or once the beam has been off it for a while.
    if (shine.lit < shine.hold && shine.age < shine.hold + 3) return;
    shine.eyes.visible = false;
    const { x, y, z } = shine.eyes.position;
    if (lit && Math.random() < 0.5) startleAt(ctx, pool, shine.kind, { x, y: y - ANIMALS[shine.kind].height + 0.5, z });
    shine = null;
  });
}
