/**
 * Pose curves for every character kind, as pure functions of time and walk phase. Angles are
 * radians. A positive X rotation swings a hanging limb forward (toward -Z, the way the model
 * faces); a negative one bends a knee back. `walk` blends from idle (0) to walking (1).
 */

const TAU = Math.PI * 2;

export interface Limb {
  /** Forward swing of the upper part. */
  swing: number;
  /** Bend of the lower part: elbows forward (positive), knees back (negative). */
  bend: number;
}

export interface HumanPose {
  /** Hip height offset in meters. */
  bodyY: number;
  /** Sideways hip shift in meters. */
  bodyX: number;
  /** Forward lean of the back. */
  torsoPitch: number;
  torsoRoll: number;
  torsoYaw: number;
  /** Vertical chest scale for breathing. */
  chest: number;
  /** Up is positive. */
  headPitch: number;
  headYaw: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
}

export interface PoseInput {
  /** Seconds since the character was made. */
  t: number;
  /** Stride cycles walked: one cycle is a left and a right step. */
  phase: number;
  /** 0 standing, 1 walking. */
  walk: number;
  /** 0 standing, 1 seated. */
  sit: number;
  /** Meters from the ground under the character up to the seat it sits on. */
  seat: number;
  /** Per-character offset so a crowd doesn't breathe in step. */
  seed: number;
}

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const unit = (k: number) => Math.max(0, Math.min(1, k));
const mixLimb = (a: Limb, b: Limb, k: number): Limb => ({ swing: mix(a.swing, b.swing, k), bend: mix(a.bend, b.bend, k) });

/** Breathing, slow weight shifts from one leg to the other, and a wandering gaze. */
function humanIdle(t: number, seed: number): HumanPose {
  const breath = Math.sin((TAU * t) / 4.2 + seed);
  const shift = Math.sin((TAU * t) / 9.5 + seed * 3.1);
  return {
    bodyY: -0.006 * Math.abs(shift),
    bodyX: 0.02 * shift,
    torsoPitch: 0.01 * breath,
    torsoRoll: -0.025 * shift,
    torsoYaw: 0,
    chest: 1 + 0.018 * breath,
    headPitch: 0.04 * Math.sin(t / 7.1 + seed),
    headYaw: 0.12 * Math.sin(t / 5.3 + seed * 2) * Math.sin(t / 2.9),
    armL: { swing: 0.02 * breath, bend: 0.12 },
    armR: { swing: 0.02 * breath, bend: 0.12 },
    legL: { swing: 0, bend: -0.1 * Math.max(0, -shift) },
    legR: { swing: 0, bend: -0.1 * Math.max(0, shift) },
  };
}

/** A plain, slightly stiff walk: legs swing about 25 degrees, arms against them. */
function humanWalk(phase: number): HumanPose {
  const a = TAU * phase;
  const swing = Math.sin(a);
  return {
    bodyY: -0.028 * swing * swing,
    bodyX: 0.012 * Math.sin(a + Math.PI / 2),
    torsoPitch: 0.05,
    torsoRoll: 0.02 * Math.cos(a),
    torsoYaw: 0.07 * swing,
    chest: 1,
    headPitch: -0.03,
    headYaw: -0.05 * swing,
    armL: { swing: -0.32 * swing, bend: 0.2 + 0.15 * Math.max(0, -swing) },
    armR: { swing: 0.32 * swing, bend: 0.2 + 0.15 * Math.max(0, swing) },
    legL: { swing: 0.45 * swing, bend: -0.7 * Math.max(0, Math.cos(a)) },
    legR: { swing: -0.45 * swing, bend: -0.7 * Math.max(0, -Math.cos(a)) },
  };
}

/**
 * On a chair or the edge of a bed: thighs level, shins hanging, a slight slump, hands on the
 * knees. Hip height is the model's to set, since only it knows how long the legs are.
 */
function humanSeated(t: number, seed: number): HumanPose {
  const breath = Math.sin((TAU * t) / 4.6 + seed);
  return {
    bodyY: 0,
    bodyX: 0,
    torsoPitch: 0.16 + 0.01 * breath,
    torsoRoll: 0,
    torsoYaw: 0,
    chest: 1 + 0.015 * breath,
    headPitch: 0.03 * Math.sin(t / 7.7 + seed),
    headYaw: 0.06 * Math.sin(t / 6.1 + seed * 2),
    armL: { swing: 0.55, bend: 0.75 },
    armR: { swing: 0.55, bend: 0.75 },
    legL: { swing: 1.5, bend: -1.45 },
    legR: { swing: 1.5, bend: -1.45 },
  };
}

function mixHuman(a: HumanPose, b: HumanPose, k: number): HumanPose {
  return {
    bodyY: mix(a.bodyY, b.bodyY, k),
    bodyX: mix(a.bodyX, b.bodyX, k),
    torsoPitch: mix(a.torsoPitch, b.torsoPitch, k),
    torsoRoll: mix(a.torsoRoll, b.torsoRoll, k),
    torsoYaw: mix(a.torsoYaw, b.torsoYaw, k),
    chest: mix(a.chest, b.chest, k),
    headPitch: mix(a.headPitch, b.headPitch, k),
    headYaw: mix(a.headYaw, b.headYaw, k),
    armL: mixLimb(a.armL, b.armL, k),
    armR: mixLimb(a.armR, b.armR, k),
    legL: mixLimb(a.legL, b.legL, k),
    legR: mixLimb(a.legR, b.legR, k),
  };
}

export function humanPose({ t, phase, walk, sit, seed }: PoseInput): HumanPose {
  const standing = mixHuman(humanIdle(t, seed), humanWalk(phase), unit(walk));
  return mixHuman(standing, humanSeated(t, seed), unit(sit));
}

/** Hip height under the cape; seated the hips come down to the seat and the hem sinks through it. */
const LOYON_HIP = 0.9;
/** Knee to sole under the cape, so seated feet reach the floor below the seat. */
const LOYON_SHIN = 0.45;

export interface LoyonPose {
  bodyY: number;
  /** Lean to the side, positive toward +X. */
  roll: number;
  /** Forward lean. */
  pitch: number;
  /** Feet offsets along Z (negative is forward) and lift in meters. */
  footL: { z: number; lift: number };
  footR: { z: number; lift: number };
  headRoll: number;
}

/**
 * Le Loyon barely moves when he stands: no breathing to see, only, every so often, a slow tilt
 * of the head that stays. His walk limps on the left leg: the body sinks and leans onto it and
 * the step lingers there.
 */
export function loyonPose({ t, phase, walk, sit, seat, seed }: PoseInput): LoyonPose {
  const k = unit(walk);
  const s = unit(sit);
  // Uneven cycle: the warp makes the left stance last longer than the right.
  const a = TAU * phase + 0.55 * Math.sin(TAU * phase);
  const stride = Math.sin(a);
  const leftStance = Math.max(0, -Math.cos(a));
  const tiltCycle = (t + seed * 7) % 13;
  const tilt = tiltCycle > 9 ? Math.min(1, (tiltCycle - 9) / 2.5) : 0;
  // Seated he folds forward over his knees, feet out in front, and the head goes still.
  return {
    bodyY: mix(k * (-0.05 * leftStance - 0.012 * stride * stride), seat - LOYON_HIP, s),
    roll: k * (-0.07 * leftStance + 0.015),
    pitch: mix(k * 0.06, 0.32, s),
    footL: { z: mix(-0.16 * stride * k, -0.42, s), lift: mix(0.05 * Math.max(0, Math.cos(a)) * k, seat - LOYON_SHIN, s) },
    footR: { z: mix(0.16 * stride * k, -0.42, s), lift: mix(0.07 * leftStance * k, seat - LOYON_SHIN, s) },
    headRoll: (1 - k) * (1 - s) * 0.16 * tilt,
  };
}

export interface QuadrupedPose {
  bodyY: number;
  /** Front left, front right, back left, back right. */
  legs: [number, number, number, number];
  headPitch: number;
  headYaw: number;
  tail: number;
}

/** Leg phase offsets: a trot moves diagonal pairs together, a cow's walk moves one leg at a time. */
export const gaits = {
  trot: [0, 0.5, 0.5, 0] as const,
  walk: [0, 0.5, 0.75, 0.25] as const,
};

export function quadrupedPose(
  { t, phase, walk, seed }: PoseInput,
  gait: readonly [number, number, number, number],
  graze: number,
): QuadrupedPose {
  const k = unit(walk);
  const legs = gait.map((offset) => 0.42 * k * Math.sin(TAU * (phase + offset))) as QuadrupedPose['legs'];
  // Every so often the head goes down to sniff or graze, then comes back up.
  const lowered = Math.max(0, Math.sin(t / 3.7 + seed)) ** 3;
  return {
    bodyY: -0.015 * k * Math.abs(Math.sin(TAU * phase * 2)),
    legs,
    headPitch: (1 - k) * graze * lowered + 0.04 * Math.sin(t * 0.9 + seed),
    headYaw: 0.25 * (1 - k) * Math.sin(t / 4.3 + seed * 2),
    tail: 0.25 * Math.sin(t * (1.5 + k * 3) + seed),
  };
}
