import { Group, Mesh, type BufferGeometry, type Object3D } from 'three';
import { partMaterial, piedTexture, type PartStyle } from './materials';
import type { CharacterModel, Look } from './model';
import { gaits, quadrupedPose, type PoseInput } from './poses';
import { block, taperedBox } from './shapes';

type Part = (geometry: BufferGeometry, style: PartStyle | number) => Mesh;

function partFactory(): Part {
  const cache = new Map<string, ReturnType<typeof partMaterial>>();
  return (geometry, style) => {
    const resolved = typeof style === 'number' ? { color: style } : style;
    const key = `${String(resolved.color)}|${resolved.map?.uuid ?? ''}`;
    const material = cache.get(key) ?? partMaterial(resolved);
    cache.set(key, material);
    return new Mesh(geometry, material);
  };
}

function pivot(parent: Object3D, x: number, y: number, z: number): Group {
  const group = new Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

interface QuadrupedRig {
  root: Group;
  body: Group;
  head: Group;
  legs: Group[];
  tail: Group;
}

function quadrupedModel(
  rig: QuadrupedRig,
  options: { eyeHeight: number; stride: number; walkSpeed: number; gait: readonly [number, number, number, number]; graze: number },
): CharacterModel {
  const restY = rig.body.position.y;
  return {
    root: rig.root,
    eyeHeight: options.eyeHeight,
    stride: options.stride,
    walkSpeed: options.walkSpeed,
    neckLimit: 0.9,
    pose: (input: PoseInput, look: Look) => {
      const pose = quadrupedPose(input, options.gait, options.graze);
      rig.body.position.y = restY + pose.bodyY;
      rig.legs.forEach((leg, i) => (leg.rotation.x = pose.legs[i]!));
      rig.head.rotation.set(pose.headPitch + look.pitch, pose.headYaw + look.yaw, 0, 'YXZ');
      rig.tail.rotation.z = pose.tail;
    },
  };
}

/** Bari: an old Bernese cross, black with tan legs and a white chest, a bell on a red collar. */
export function buildDog(): CharacterModel {
  const part = partFactory();
  const black = 0x1a1815;
  const tan = 0x6e4426;
  const white = 0xa8a294;
  const root = new Group();
  const body = pivot(root, 0, 0.4, 0);
  body.add(part(taperedBox({ w: 0.28, d: 0.7 }, { w: 0.24, d: 0.66 }, 0.24, -0.04), black));
  body.add(part(block(0.2, 0.06, -0.02, 0.2, -0.35), white));

  // The head sits up on a short neck, ahead of the shoulders, so the dog reads from the front.
  const head = pivot(body, 0, 0.3, -0.36);
  body.add(part(taperedBox({ w: 0.2, d: 0.16, z: -0.34 }, { w: 0.24, d: 0.2, z: -0.28 }, 0.32, 0.12), black));
  head.add(part(block(0.21, 0.21, -0.02, 0.19, -0.04), black));
  head.add(part(block(0.12, 0.15, -0.03, 0.08, -0.2), white));
  head.add(part(block(0.06, 0.03, 0.04, 0.08, -0.28), 0x0b0a09));
  [-1, 1].forEach((side) => {
    head.add(part(block(0.035, 0.09, -0.08, 0.17, -0.02).translate(side * 0.12, 0, 0), black));
    head.add(part(block(0.04, 0.01, 0.12, 0.15, -0.15).translate(side * 0.05, 0, 0), tan));
  });
  head.add(part(block(0.22, 0.2, -0.07, -0.02, 0.03), 0x6a1a14));
  head.add(part(block(0.045, 0.045, -0.13, -0.07, -0.08), 0x8a7638));

  const legs = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].map(([side, end]) => {
    const leg = pivot(body, side! * 0.085, 0, end! * 0.25);
    leg.add(part(block(0.08, 0.09, 0, -0.26), black));
    leg.add(part(block(0.07, 0.08, -0.26, -0.37), tan));
    leg.add(part(block(0.08, 0.12, -0.37, -0.4, -0.02), white));
    return leg;
  });

  const tail = pivot(body, 0, 0.2, 0.34);
  tail.rotation.x = -0.5;
  tail.add(part(block(0.07, 0.07, 0, -0.3), black));
  tail.add(part(block(0.07, 0.07, -0.3, -0.36), white));

  return quadrupedModel({ root, body, head, legs, tail }, { eyeHeight: 0.6, stride: 0.75, walkSpeed: 1.0, gait: gaits.trot, graze: 0.45 });
}

/** Marquise: a black pied Fribourg heifer with short horns and a cowbell on a leather strap. */
export function buildCow(): CharacterModel {
  const part = partFactory();
  const hide = { color: 0xd8d4c8, map: piedTexture(), tile: 0.7 };
  const root = new Group();
  const body = pivot(root, 0, 0.75, 0);
  body.add(part(taperedBox({ w: 0.52, d: 1.45 }, { w: 0.46, d: 1.38 }, 0.55, 0), hide));
  body.add(part(taperedBox({ w: 0.3, d: 0.3, z: -0.72 }, { w: 0.32, d: 0.36, z: -0.66 }, 0.5, 0.08), hide));

  const head = pivot(body, 0, 0.45, -0.82);
  head.rotation.x = 0.25;
  head.add(part(taperedBox({ w: 0.3, d: 0.26, z: -0.08 }, { w: 0.22, d: 0.22, z: -0.26 }, 0.14, -0.28), hide));
  head.add(part(block(0.21, 0.16, -0.28, -0.16, -0.32), 0x8a7068));
  [-1, 1].forEach((side) => {
    head.add(part(block(0.12, 0.05, 0.03, 0.08, -0.02).translate(side * 0.18, 0, 0), 0x1b1916));
    head.add(part(block(0.04, 0.04, 0.12, 0.18, -0.04).translate(side * 0.09, 0, 0), 0xb8ac8a));
  });
  body.add(part(block(0.35, 0.4, 0.14, 0.2, -0.69), 0x3a2a1c));
  body.add(part(taperedBox({ w: 0.08, d: 0.06, z: -0.82 }, { w: 0.11, d: 0.09, z: -0.82 }, 0.14, -0.02), 0x7a6232));

  const legs = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].map(([side, end]) => {
    const leg = pivot(body, side! * 0.16, 0.02, end! * 0.56);
    leg.add(part(block(0.12, 0.14, 0.05, -0.6), end! < 0 ? 0x1c1a17 : 0xcfcabd));
    leg.add(part(block(0.12, 0.14, -0.6, -0.75), 0x23201b));
    return leg;
  });

  const tail = pivot(body, 0, 0.5, 0.7);
  tail.add(part(block(0.04, 0.04, 0, -0.65), 0x1c1a17));

  return quadrupedModel({ root, body, head, legs, tail }, { eyeHeight: 1.1, stride: 1.4, walkSpeed: 0.9, gait: gaits.walk, graze: 0.7 });
}
