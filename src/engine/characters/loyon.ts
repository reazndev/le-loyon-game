import { Group, Mesh } from 'three';
import type { TextureLibrary } from '../render/textures';
import { partMaterial } from './materials';
import type { CharacterModel, Look } from './model';
import { loyonPose, type PoseInput } from './poses';
import { block, lathe, projectFront, shadeDown, taperedBox, type Ring } from './shapes';

const SIDES = 16;

/**
 * The tent sheet from the hem up to the neck. It hangs from a body: the shoulders are its widest
 * point, it falls slack over the chest, closes in at the waist, and opens a little to the hem in
 * long folds that deepen as they fall.
 */
const CAPE: Ring[] = [
  { y: 0.08, rx: 0.235, rz: 0.19, z: 0.02, ripple: 0.034 },
  { y: 0.5, rx: 0.222, rz: 0.17, z: 0.01, ripple: 0.03 },
  { y: 0.95, rx: 0.205, rz: 0.15, ripple: 0.022 },
  { y: 1.2, rx: 0.232, rz: 0.15, front: 0.025, ripple: 0.014 },
  { y: 1.41, rx: 0.272, rz: 0.14, ripple: 0.006 },
  { y: 1.47, rx: 0.25, rz: 0.125 },
  { y: 1.52, rx: 0.17, rz: 0.11 },
  { y: 1.57, rx: 0.095, rz: 0.09, z: 0.01 },
];
const NECK_Y = 1.56;

/** The hood around the head, relative to the neck. It reaches past the mask, so the mask sits inside it. */
const HOOD_SIDES: Ring[] = [
  { y: -0.08, rx: 0.19, rz: 0.17, z: 0.0 },
  { y: 0.06, rx: 0.15, rz: 0.165, z: -0.025 },
  { y: 0.21, rx: 0.145, rz: 0.165, z: -0.03 },
];
/** Above the face it closes and comes forward over the brow, so the mask sits in its shadow. */
const HOOD_TOP: Ring[] = [
  { y: 0.21, rx: 0.145, rz: 0.165, z: -0.03, front: 0.03 },
  { y: 0.3, rx: 0.12, rz: 0.145, z: -0.01, front: 0.025 },
  { y: 0.37, rx: 0.05, rz: 0.08, z: 0.04 },
];
const MASK: Ring[] = [
  { y: -0.01, rx: 0.065, rz: 0.08, z: -0.045, front: 0.025 },
  { y: 0.08, rx: 0.088, rz: 0.1, z: -0.045, front: 0.03 },
  { y: 0.17, rx: 0.092, rz: 0.1, z: -0.04 },
  { y: 0.26, rx: 0.075, rz: 0.085, z: -0.035 },
];
/** The bare hand: out of the fold below the chest, a little to his right, held out in front. */
const HAND = { x: -0.06, y: 1.08, z: -0.27 };

/**
 * Le Loyon: a tall shape in a camo cape that falls from a hood to the ankles, with the tan gas
 * mask deep in the hood. One bare hand comes out of the cape below the chest, where a level can
 * put a candle (`hand`). The mask never comes off.
 */
export function buildLoyon(textures: TextureLibrary): CharacterModel {
  const camo = partMaterial({ color: 0x524e45, map: textures.get('camo_cape'), tile: 0.7 });
  // The cape fades into shadow toward the hem, so a light at the hand shows only the top of him.
  camo.vertexColors = true;
  const hood = partMaterial({ color: 0x524e45, map: textures.get('camo_cape'), tile: 0.7 });
  const shadow = partMaterial({ color: 0x0a0907 });
  const skin = partMaterial({ color: 0x7e6e5e });
  const boots = partMaterial({ color: 0x1b1a16 });
  const mask = partMaterial({ color: 0xc8c0ae, map: textures.get('gas_mask'), tile: 1, alphaTest: 0.5 });

  const root = new Group();
  const body = new Group();
  root.add(body);
  body.add(new Mesh(shadeDown(lathe(CAPE, SIDES), 0.3, 1.6, 0.05), camo));

  const head = new Group();
  head.position.set(0, NECK_Y, 0);
  body.add(head);
  head.add(new Mesh(lathe(HOOD_SIDES, SIDES, [3 / 32, 29 / 32]), hood));
  head.add(new Mesh(lathe(HOOD_TOP, SIDES), hood));
  // The dark inside of the hood, behind and around the mask.
  head.add(new Mesh(lathe([{ y: -0.05, rx: 0.14, rz: 0.13, z: 0.02 }, { y: 0.25, rx: 0.13, rz: 0.13, z: 0.02 }], 8), shadow));
  head.add(new Mesh(projectFront(lathe(MASK, 10, [-0.2, 0.2]), { x0: -0.13, x1: 0.13, y0: -0.015, y1: 0.275 }), mask));

  // The forearm comes out of the cape's front fold and bends up to the hand.
  body.add(new Mesh(taperedBox({ w: 0.09, d: 0.1 }, { w: 0.075, d: 0.085 }, 0, -0.2).rotateX(-1.35).translate(HAND.x, HAND.y - 0.01, HAND.z + 0.1), hood));
  // A fist, the thumb on top.
  body.add(new Mesh(block(0.072, 0.075, HAND.y - 0.045, HAND.y + 0.03, HAND.z), skin));
  body.add(new Mesh(block(0.026, 0.045, HAND.y + 0.03, HAND.y + 0.048, HAND.z - 0.005).translate(0.02, 0, 0), skin));
  const hand = new Group();
  hand.position.set(HAND.x, HAND.y + 0.03, HAND.z);
  body.add(hand);

  const feet = [-1, 1].map((side) => {
    const foot = new Group();
    foot.position.x = side * 0.11;
    foot.add(new Mesh(block(0.12, 0.29, 0, 0.13, -0.04), boots));
    root.add(foot);
    return foot;
  }) as [Group, Group];

  return {
    root,
    eyeHeight: 1.76,
    stride: 1.05,
    // About half a normal walk: slow enough that it looks wrong.
    walkSpeed: 0.62,
    neckLimit: 0.3,
    hand,
    pose: (input: PoseInput, look: Look) => {
      const pose = loyonPose(input);
      body.position.y = pose.bodyY;
      // Positive pitch leans forward; a positive X turn would tip him back.
      body.rotation.set(-pose.pitch, 0, pose.roll);
      head.rotation.set(look.pitch, look.yaw, pose.headRoll, 'YXZ');
      feet[0].position.set(feet[0].position.x, pose.footL.lift, pose.footL.z);
      feet[1].position.set(feet[1].position.x, pose.footR.lift, pose.footR.z);
    },
  };
}
