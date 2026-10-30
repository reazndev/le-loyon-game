import { Group, Mesh } from 'three';
import type { TextureLibrary } from '../render/textures';
import { partMaterial } from './materials';
import type { CharacterModel, Look } from './model';
import { loyonPose, type PoseInput } from './poses';
import { block, drape, facePlate } from './shapes';

const SIDES = 12;
/** Alternating column radii give the cape its long vertical folds. */
const folds = (base: number[], ripple: number) =>
  Array.from({ length: SIDES }, (_, i) => base[Math.round((i / SIDES) * base.length) % base.length]! + (i % 2 ? ripple : -ripple));

/**
 * Le Loyon: a tall shape in a camo cape that falls from a hood to the ankles, with the tan gas
 * mask where the face should be. No arms show and the mask never comes off.
 */
export function buildLoyon(textures: TextureLibrary): CharacterModel {
  const camo = partMaterial({ color: 0x8e887a, map: textures.get('camo_cape'), tile: 0.7 });
  const shadow = partMaterial({ color: 0x15140f });
  const boots = partMaterial({ color: 0x1b1a16 });
  const mask = partMaterial({ color: 0xc8c0ae, map: textures.get('gas_mask'), tile: 1, alphaTest: 0.5 });

  const root = new Group();
  const body = new Group();
  root.add(body);

  // Square shoulders and an almost straight fall: a long box of cloth, as in the sighting photos.
  // Shallow front to back at the top, so the hood stands out from the side as well.
  const shoulders = folds([0.13, 0.3, 0.16, 0.3], 0.01);
  const hem = folds([0.24, 0.32, 0.27, 0.33], 0.03);
  body.add(new Mesh(drape(shoulders, hem, 1.58, 0.1), camo));
  body.add(new Mesh(drape(folds([0.1, 0.12, 0.11, 0.12], 0), shoulders, 1.68, 1.58), camo));

  const head = new Group();
  head.position.set(0, 1.64, -0.02);
  body.add(head);
  // A peaked hood, pulled forward over the brow.
  head.add(new Mesh(drape(folds([0.07, 0.09, 0.1, 0.09], 0), folds([0.15, 0.16, 0.17, 0.16], 0.008), 0.34, 0, 0.95), camo));
  // The dark inside of the hood, around the mask.
  head.add(new Mesh(block(0.19, 0.05, 0.02, 0.25, -0.12), shadow));
  const face = new Mesh(facePlate(0.2, 0.23, { u0: 0, v0: 0, u1: 1, v1: 1 }), mask);
  face.position.set(0, 0.12, -0.155);
  head.add(face);
  head.add(new Mesh(block(0.17, 0.06, 0.23, 0.28, -0.12), camo));

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
    pose: (input: PoseInput, look: Look) => {
      const pose = loyonPose(input);
      body.position.y = pose.bodyY;
      body.rotation.set(pose.pitch, 0, pose.roll);
      head.rotation.set(look.pitch, look.yaw, pose.headRoll, 'YXZ');
      feet[0].position.set(feet[0].position.x, pose.footL.lift, pose.footL.z);
      feet[1].position.set(feet[1].position.x, pose.footR.lift, pose.footR.z);
    },
  };
}
