import { Group, Mesh, type BufferGeometry, type Object3D } from 'three';
import type { TextureLibrary } from '../render/textures';
import { partMaterial, type PartStyle } from './materials';
import type { CharacterModel, Look } from './model';
import { humanPose, type Limb, type PoseInput } from './poses';
import { block, facePlate, hoodShell, taperedBox } from './shapes';

export type HatKind = 'flat_cap' | 'peaked_cap' | 'bus_cap' | 'headscarf' | 'hood';

/** Everything that tells one villager from another. Colors are hex; lengths are meters. */
export interface HumanLook {
  /** Face texture, a 64 px portrait. The middle of it goes on the front of the head. */
  face: string;
  /** Multiplies the face texture; below white darkens a face in a hood. */
  faceTint?: number;
  /** Standing height. Default 1.74. */
  height?: number;
  /** Girth: 1 is average, 1.15 is heavy, 0.9 is slight. */
  build?: number;
  /** Forward bend of the back in radians, for the old. */
  stoop?: number;
  skin: number;
  hair: number;
  hairStyle?: 'short' | 'long' | 'bald';
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
const HEAD_W = 0.205;
const HEAD_D = 0.235;

/** The middle of the 64 px portraits: brow to chin, cheek to cheek. */
const FACE_CROP = { u0: 0.29, v0: 0.17, u1: 0.71, v1: 0.68 };

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
    const key = `${String(resolved.color)}|${resolved.map?.uuid ?? ''}`;
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
  const topColor = look.coat?.color ?? look.top;
  const legColor = look.overalls ?? look.legs;

  const body = joint(root, 0, HIP_Y);
  body.add(part(block(0.32 * g, 0.2 * g, -0.06, WAIST + 0.02), legColor));
  const torso = joint(body, 0, WAIST);
  const chest = joint(torso, 0, 0);
  chest.add(part(taperedBox({ w: 0.4 * g, d: 0.22 * g }, { w: 0.31 * g, d: 0.2 * g * g }, TORSO, 0), topColor));
  chest.add(part(block(0.1, 0.1, TORSO - 0.02, NECK + 0.04), look.skin));

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
    forearm.add(part(block(0.065, 0.08, -0.26, -0.35), look.skin));
    return forearm;
  }) as [Group, Group];

  const head = joint(chest, 0, NECK);
  head.add(part(block(HEAD_W, HEAD_D, 0.01, HEAD), look.skin));
  const face = part(facePlate(0.185, 0.225, FACE_CROP), { color: look.faceTint ?? 0xffffff, map: textures.get(look.face), tile: 1 });
  face.position.set(0, 0.135, -HEAD_D / 2 - 0.004);
  head.add(face);

  addHair(head, look, part);
  if (look.hat) addHat(head, chest, look.hat, part);
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

type PartFactory = (geometry: BufferGeometry, style: PartStyle | number) => Mesh;

function addHair(head: Object3D, look: HumanLook, part: PartFactory): void {
  const style = look.hairStyle ?? 'short';
  if (style === 'bald') {
    head.add(part(block(HEAD_W + 0.012, 0.1, 0.06, 0.15, 0.07), look.hair));
    return;
  }
  head.add(part(block(HEAD_W + 0.02, HEAD_D + 0.02, HEAD - 0.04, HEAD + 0.035, 0.005), look.hair));
  const bottom = style === 'long' ? -0.12 : 0.05;
  head.add(part(block(HEAD_W + 0.02, 0.07, bottom, HEAD, HEAD_D / 2 - 0.02), look.hair));
  if (style === 'long') {
    [-1, 1].forEach((side) => head.add(part(block(0.035, 0.16, -0.06, HEAD, 0.03).translate((side * (HEAD_W + 0.02)) / 2, 0, 0), look.hair)));
  }
}

function addHat(head: Object3D, chest: Object3D, hat: NonNullable<HumanLook['hat']>, part: PartFactory): void {
  const front = -HEAD_D / 2;
  switch (hat.kind) {
    case 'flat_cap':
      head.add(part(taperedBox({ w: HEAD_W + 0.04, d: HEAD_D + 0.04, z: -0.01 }, { w: HEAD_W + 0.025, d: HEAD_D + 0.025 }, HEAD + 0.055, HEAD - 0.02), hat.color));
      head.add(part(block(0.19, 0.07, HEAD - 0.025, HEAD - 0.005, front - 0.025), hat.color));
      break;
    case 'peaked_cap':
    case 'bus_cap':
      head.add(part(taperedBox({ w: HEAD_W + 0.05, d: HEAD_D + 0.05, z: -0.01 }, { w: HEAD_W + 0.02, d: HEAD_D + 0.02 }, HEAD + 0.07, HEAD - 0.03), hat.color));
      head.add(part(block(0.18, 0.08, HEAD - 0.035, HEAD - 0.015, front - 0.03), 0x1c1c1a));
      if (hat.band) head.add(part(block(HEAD_W + 0.026, HEAD_D + 0.026, HEAD - 0.03, HEAD + 0.005), hat.band));
      break;
    case 'headscarf':
      head.add(part(hoodShell(HEAD_W + 0.05, HEAD_D + 0.05, -0.02, HEAD + 0.05, front + 0.03), hat.color));
      head.add(part(block(0.12, 0.05, -0.04, 0.06, HEAD_D / 2 + 0.02), hat.color));
      break;
    case 'hood':
      head.add(part(hoodShell(HEAD_W + 0.07, HEAD_D + 0.08, -0.05, HEAD + 0.07, front - 0.025), hat.color));
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
