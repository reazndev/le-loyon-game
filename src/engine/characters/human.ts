import { DoubleSide, Group, Mesh, type BufferGeometry, type Object3D } from 'three';
import type { TextureLibrary } from '../render/textures';
import { partMaterial, type PartStyle } from './materials';
import type { CharacterModel, Look } from './model';
import { humanPose, type Limb, type PoseInput } from './poses';
import { block, lathe, projectFront, splitFront, taperedBox, type Ring } from './shapes';

export type HatKind = 'flat_cap' | 'peaked_cap' | 'bus_cap' | 'headscarf' | 'hood';

/**
 * The face textures and the skin each one fades into at its edge, so the rest of the head, the
 * neck, and the hands match the face. Measured from the processed textures; see
 * docs/characters.md for how they are made.
 */
export const faceSkin = {
  face_driver: 0x816659,
  face_farmer: 0xa86b58,
  face_innkeeper: 0xa6775c,
  face_mechanic: 0x826254,
  face_old_woman: 0xa27660,
  face_priest: 0xa87a62,
  face_shopkeeper: 0x9b7464,
  face_watchman: 0x926b59,
  face_widow: 0x825d4e,
  face_young_man: 0x8a6f64,
  face_young_woman: 0x97776c,
} as const;
export type FaceTexture = keyof typeof faceSkin;

/** Everything that tells one villager from another. Colors are hex; lengths are meters. */
export interface HumanLook {
  /** Face texture, a small crop from hairline to chin that fades into the skin at its edge, projected onto the front of the head. */
  face: FaceTexture;
  /** Multiplies the whole head; below white darkens a face in a hood. */
  faceTint?: number;
  /** Standing height. Default 1.74. */
  height?: number;
  /** Girth: 1 is average, 1.15 is heavy, 0.9 is slight. */
  build?: number;
  /** Forward bend of the back in radians, for the old. */
  stoop?: number;
  hair: number;
  hairStyle?: 'short' | 'bob' | 'long' | 'bald';
  hat?: { kind: HatKind; color: number; band?: number };
  /** Shirt or jumper, on the torso and arms. */
  top: number;
  legs: number;
  shoes: number;
  /** A coat over the top, with a skirt below the waist `length` long. */
  coat?: { color: number; length: number };
  /** Bib overalls: a bib on the chest and trousers in this color. */
  overalls?: number;
  skirt?: { color: number; length: number };
  apron?: number;
  /** A clerical collar tab at the throat. */
  collar?: number;
}

/** Proportions of a 1.76 m adult; the whole model is scaled to `height`. */
const BASE_HEIGHT = 1.76;
const HIP_Y = 0.9;
const WAIST = 0.1;
const TORSO = 0.46;
const NECK = 0.5;
const HEAD = 0.27;
const HEAD_SIDES = 10;

/**
 * The head from under the chin to the crown, relative to the neck joint. Ten sides with a flat
 * facet forward; the chin and brow stand out a little so the face catches light like a face.
 */
const HEAD_RINGS: Ring[] = [
  { y: 0.005, rx: 0.045, rz: 0.05, z: -0.03 },
  { y: 0.03, rx: 0.07, rz: 0.08, z: -0.02, front: 0.008 },
  { y: 0.075, rx: 0.092, rz: 0.1, z: -0.008 },
  { y: 0.13, rx: 0.102, rz: 0.114 },
  { y: 0.185, rx: 0.104, rz: 0.117, front: 0.008 },
  { y: 0.235, rx: 0.098, rz: 0.113 },
  { y: HEAD, rx: 0.068, rz: 0.086, z: 0.004 },
];
/** Where the face picture lands: cheek to cheek, chin to hairline. */
const FACE_BOX = { x0: -0.1, x1: 0.1, y0: 0.02, y1: 0.245 };
/** Where the hair or a hat meets the forehead. */
const HAIRLINE = 0.228;

/** The head's section at height `y`, grown outward by `grow`, for hair and hats that fit over it. */
function around(y: number, grow: number, extra: Partial<Ring> = {}): Ring {
  const above = HEAD_RINGS.findIndex((ring) => ring.y >= y);
  const hi = HEAD_RINGS[above < 0 ? HEAD_RINGS.length - 1 : Math.max(above, 1)]!;
  const lo = HEAD_RINGS[above < 0 ? HEAD_RINGS.length - 2 : Math.max(above - 1, 0)]!;
  const t = Math.min(1, Math.max(0, (y - lo.y) / (hi.y - lo.y)));
  const mix = (a: number, b: number) => a + (b - a) * t;
  return { y, rx: mix(lo.rx, hi.rx) + grow, rz: mix(lo.rz, hi.rz) + grow, z: mix(lo.z ?? 0, hi.z ?? 0), ...extra };
}

/** An ear on the `side` of the head (-1 is the left as seen from the front), level with the eyes and nose. */
const ear = (side: number) => taperedBox({ w: 0.014, d: 0.036, z: 0.014 }, { w: 0.012, d: 0.026, z: 0.018 }, 0.165, 0.112).translate(side * around(0.135, 0).rx, 0, 0);

/** A shell fitted over the head through these heights, each `[y, grow]`. */
const fitted = (sections: [number, number][], arc?: [number, number]) => lathe(sections.map(([y, grow]) => around(y, grow)), HEAD_SIDES, arc);

interface Joints {
  body: Object3D;
  torso: Object3D;
  chest: Object3D;
  head: Object3D;
  arms: [Object3D, Object3D];
  forearms: [Object3D, Object3D];
  thighs: [Object3D, Object3D];
  shins: [Object3D, Object3D];
}

/** Builds a villager from boxes: about 300 triangles, posed by turning joint pivots. */
export function buildHuman(look: HumanLook, textures: TextureLibrary): CharacterModel {
  const g = look.build ?? 1;
  const materials = new Map<string, ReturnType<typeof partMaterial>>();
  const part = (geometry: BufferGeometry, style: PartStyle | number): Mesh => {
    const resolved = typeof style === 'number' ? { color: style } : style;
    const key = `${String(resolved.color)}|${resolved.map?.uuid ?? ''}|${resolved.side ?? ''}`;
    const material = materials.get(key) ?? partMaterial(resolved);
    materials.set(key, material);
    return new Mesh(geometry, material);
  };
  const joint = (parent: Object3D, x: number, y: number, z = 0): Group => {
    const pivot = new Group();
    pivot.position.set(x, y, z);
    parent.add(pivot);
    return pivot;
  };

  const root = new Group();
  const skin = faceSkin[look.face];
  const headSkin = look.faceTint === undefined ? skin : multiply(skin, look.faceTint);
  const topColor = look.coat?.color ?? look.top;
  const legColor = look.overalls ?? look.legs;

  const body = joint(root, 0, HIP_Y);
  body.add(part(block(0.32 * g, 0.2 * g, -0.06, WAIST + 0.02), legColor));
  const torso = joint(body, 0, WAIST);
  const chest = joint(torso, 0, 0);
  chest.add(part(taperedBox({ w: 0.4 * g, d: 0.22 * g }, { w: 0.31 * g, d: 0.2 * g * g }, TORSO, 0), topColor));
  chest.add(part(lathe([{ y: TORSO - 0.02, rx: 0.052, rz: 0.055 }, { y: NECK + 0.04, rx: 0.046, rz: 0.05, z: 0.008 }], 6), headSkin));

  const thighs = [-1, 1].map((side) => joint(body, side * 0.09 * g, 0)) as [Group, Group];
  const shins = thighs.map((thigh) => {
    thigh.add(part(taperedBox({ w: 0.15 * g, d: 0.17 * g }, { w: 0.12, d: 0.13 }, 0, -0.42), legColor));
    const shin = joint(thigh, 0, -0.42);
    shin.add(part(taperedBox({ w: 0.12, d: 0.13 }, { w: 0.09, d: 0.1 }, 0, -0.34), look.skirt ? look.legs : legColor));
    shin.add(part(block(0.11, 0.25, -0.34, -0.41, -0.05), look.shoes));
    return shin;
  }) as [Group, Group];

  const arms = [-1, 1].map((side) => joint(chest, side * (0.2 * g + 0.04), TORSO - 0.05)) as [Group, Group];
  const forearms = arms.map((arm) => {
    arm.add(part(taperedBox({ w: 0.1, d: 0.11 }, { w: 0.085, d: 0.09 }, 0.04, -0.3), topColor));
    const forearm = joint(arm, 0, -0.3);
    forearm.add(part(taperedBox({ w: 0.085, d: 0.09 }, { w: 0.07, d: 0.075 }, 0, -0.26), topColor));
    forearm.add(part(block(0.065, 0.08, -0.26, -0.35), skin));
    return forearm;
  }) as [Group, Group];

  const head = joint(chest, 0, NECK);
  const [front, skull] = splitFront(lathe(HEAD_RINGS, HEAD_SIDES), 0.55);
  head.add(part(projectFront(front, FACE_BOX), { color: look.faceTint ?? 0xffffff, map: textures.get(look.face), tile: 1 }));
  head.add(part(skull, headSkin));

  const covered = look.hat?.kind === 'headscarf' || look.hat?.kind === 'hood';
  if (!covered) [-1, 1].forEach((side) => head.add(part(ear(side), headSkin)));
  // Hair and hats are open shells: their insides show between the face and the hair.
  const shell: PartFactory = (geometry, style) => part(geometry, { ...(typeof style === 'number' ? { color: style } : style), side: DoubleSide });
  addHair(head, look, shell);
  if (look.hat) addHat(head, chest, look.hat, shell);
  addClothes({ body, chest }, look, g, part);

  root.scale.setScalar((look.height ?? 1.74) / BASE_HEIGHT);
  const scale = root.scale.x;
  const joints: Joints = { body, torso, chest, head, arms, forearms, thighs, shins };
  const stoop = look.stoop ?? 0;
  const hand = new Group();
  hand.position.y = -0.31;
  forearms[1].add(hand);
  const model: CharacterModel = {
    root,
    eyeHeight: (HIP_Y + WAIST + NECK + 0.14) * scale,
    stride: 1.25 * scale,
    walkSpeed: 1.1 * scale - stoop * 0.8,
    neckLimit: 1.1,
    hand,
    holding: false,
    pose: (input: PoseInput, lookAt: Look) => applyPose(joints, humanPose(input), lookAt, { stoop, holding: model.holding ?? false, sit: input.sit, seatY: input.seat / scale }),
  };
  return model;
}

/** Two hex colors multiplied channel by channel, as a tint darkens a color. */
function multiply(a: number, b: number): number {
  const channel = (shift: number) => Math.round((((a >> shift) & 0xff) * ((b >> shift) & 0xff)) / 255) << shift;
  return channel(16) | channel(8) | channel(0);
}

type PartFactory = (geometry: BufferGeometry, style: PartStyle | number) => Mesh;

/** Short hair covers the head from the ears back, so the temples and cheeks show skin. */
const BACK_HAIR: [number, number] = [0.25, 0.75];

function addHair(head: Object3D, look: HumanLook, part: PartFactory): void {
  const style = look.hairStyle ?? 'short';
  if (style === 'bald') {
    head.add(part(fitted([[0.07, 0.006], [0.17, 0.008]], [0.25, 0.75]), look.hair));
    return;
  }
  if (style === 'bob') {
    // Full and curled, down to the jaw: it stands out past the cheeks, so it frames the face from the front.
    head.add(part(fitted([[HAIRLINE - 0.006, 0.014], [0.25, 0.03], [HEAD + 0.02, 0.026]]), look.hair));
    head.add(part(lathe([around(0.035, 0.035), around(0.1, 0.055), around(0.18, 0.05), around(HAIRLINE + 0.01, 0.03)], HEAD_SIDES, [0.15, 0.85]), look.hair));
    return;
  }
  head.add(part(fitted([[HAIRLINE, 0.008], [0.25, 0.01], [HEAD + 0.012, 0.012]]), look.hair));
  if (style === 'short') {
    head.add(part(fitted([[0.07, 0.006], [HAIRLINE + 0.01, 0.009]], BACK_HAIR), look.hair));
    return;
  }
  // Long hair falls past the jaw onto the shoulders, wider at the ends.
  head.add(part(lathe([{ y: -0.12, rx: 0.14, rz: 0.11, z: 0.03 }, around(0.1, 0.03), around(HAIRLINE + 0.01, 0.018)], HEAD_SIDES, [0.15, 0.85]), look.hair));
}

function addHat(head: Object3D, chest: Object3D, hat: NonNullable<HumanLook['hat']>, part: PartFactory): void {
  const front = -around(HAIRLINE, 0).rz;
  switch (hat.kind) {
    case 'flat_cap':
      head.add(part(lathe([around(HAIRLINE - 0.005, 0.014), around(0.25, 0.022, { z: -0.008 }), around(HEAD, 0.034, { y: HEAD + 0.018, z: -0.014 })], HEAD_SIDES), hat.color));
      head.add(part(block(0.17, 0.07, HAIRLINE - 0.004, HAIRLINE + 0.012, front - 0.025), hat.color));
      break;
    case 'peaked_cap':
    case 'bus_cap':
      head.add(part(lathe([around(HAIRLINE - 0.01, 0.014), around(0.25, 0.02), around(0.25, 0.03, { y: HEAD + 0.035, z: -0.006 })], HEAD_SIDES), hat.color));
      head.add(part(block(0.17, 0.08, HAIRLINE - 0.012, HAIRLINE + 0.004, front - 0.03), 0x1c1c1a));
      if (hat.band) head.add(part(fitted([[HAIRLINE - 0.006, 0.017], [HAIRLINE + 0.028, 0.02]]), hat.band));
      break;
    case 'headscarf':
      // Tied under the chin: the sides frame the face, and the top comes forward over the brow.
      head.add(part(fitted([[-0.03, 0.03], [0.1, 0.02], [HAIRLINE - 0.01, 0.018]], [0.12, 0.88]), hat.color));
      head.add(part(lathe([around(HAIRLINE - 0.01, 0.018, { front: 0.012 }), around(0.25, 0.02), around(HEAD, 0.025, { y: HEAD + 0.025 })], HEAD_SIDES), hat.color));
      head.add(part(block(0.12, 0.05, -0.04, 0.03, 0.04), hat.color));
      break;
    case 'hood':
      head.add(part(fitted([[-0.06, 0.05], [0.1, 0.04], [HAIRLINE - 0.02, 0.04]], [0.1, 0.9]), hat.color));
      head.add(part(lathe([around(HAIRLINE - 0.02, 0.04, { front: 0.03 }), around(0.25, 0.042), around(HEAD, 0.05, { y: HEAD + 0.05 })], HEAD_SIDES), hat.color));
      chest.add(part(block(0.3, 0.09, TORSO - 0.08, NECK + 0.02, 0.09), hat.color));
      break;
  }
}

function addClothes(joints: { body: Object3D; chest: Object3D }, look: HumanLook, g: number, part: PartFactory): void {
  const { body, chest } = joints;
  if (look.coat) {
    body.add(part(taperedBox({ w: 0.36 * g, d: 0.25 * g }, { w: 0.46 * g, d: 0.36 * g }, WAIST + 0.02, -look.coat.length), look.coat.color));
  }
  if (look.skirt) {
    body.add(part(taperedBox({ w: 0.34 * g, d: 0.23 * g }, { w: 0.44 * g, d: 0.33 * g }, WAIST + 0.03, -look.skirt.length), look.skirt.color));
  }
  if (look.overalls !== undefined) {
    chest.add(part(block(0.26 * g, 0.02, 0.0, TORSO * 0.62, -0.11 * g - 0.008), look.overalls));
  }
  if (look.apron !== undefined) {
    body.add(part(block(0.3 * g, 0.02, -0.5, WAIST + 0.04, -0.17 * g), look.apron));
  }
  if (look.collar !== undefined) {
    chest.add(part(block(0.045, 0.02, TORSO - 0.01, NECK + 0.02, -0.055), look.collar));
  }
}

function setLimb(upper: Object3D, lower: Object3D, limb: Limb): void {
  upper.rotation.x = limb.swing;
  lower.rotation.x = limb.bend;
}

interface PoseContext {
  stoop: number;
  holding: boolean;
  /** 0 standing, 1 seated, and the seat's height in model units. */
  sit: number;
  seatY: number;
}

function applyPose(j: Joints, pose: ReturnType<typeof humanPose>, look: Look, { stoop, holding, sit, seatY }: PoseContext): void {
  const standingY = HIP_Y + pose.bodyY - stoop * 0.04;
  j.body.position.set(pose.bodyX, standingY + (seatY - standingY) * sit, 0);
  // A positive X turn tips an upright part back, toward +Z, so a forward lean is negative here.
  j.torso.rotation.set(-(pose.torsoPitch + stoop), pose.torsoYaw, pose.torsoRoll);
  j.chest.scale.y = pose.chest;
  // The head stays level when the back bends, the way an old man looks ahead, not down.
  j.head.rotation.set(pose.headPitch + look.pitch + stoop * 0.7, pose.headYaw + look.yaw, 0, 'YXZ');
  setLimb(j.arms[0], j.forearms[0], pose.armL);
  setLimb(j.arms[1], j.forearms[1], holding ? { swing: 0.75 + pose.armR.swing * 0.15, bend: 0.55 } : pose.armR);
  j.arms[0].rotation.z = -0.07;
  j.arms[1].rotation.z = 0.07;
  setLimb(j.thighs[0], j.shins[0], pose.legL);
  setLimb(j.thighs[1], j.shins[1], pose.legR);
}
