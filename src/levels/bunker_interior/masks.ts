import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createPs1Material } from '../../engine/render/ps1Material';
import { hashString, seededRandom } from '../../engine/random';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';

/**
 * Old rubber gas masks, after gas-masks-on-floor.png: a facepiece, two round eyepieces in
 * metal rims, a filter can on the snout, and on some a corrugated hose. Hundreds are merged
 * into one mesh with vertex colors, so a whole heap is a single draw call.
 */

const RUBBER = [0x2c2319, 0x241d15, 0x201b15, 0x23221e, 0x29251f, 0x1c1b17];
const GLASS = 0x050606;
const METAL = 0x1f1e1a;

/** Keeps the shapes' indices, so the heap shares vertices instead of repeating each one per triangle. */
function tinted(geometry: BufferGeometry, color: number): BufferGeometry {
  const c = new Color(color);
  const count = geometry.getAttribute('position').count;
  geometry.setAttribute('color', new Float32BufferAttribute(Array.from({ length: count * 3 }, (_, i) => [c.r, c.g, c.b][i % 3]!), 3));
  return geometry;
}

/** One mask facing +Z, about 25 cm tall, centered on its facepiece. */
function maskGeometry(rubber: number, hose: boolean, random: () => number): BufferGeometry {
  const parts = [
    tinted(new SphereGeometry(0.11, 7, 5).scale(1, 1.2, 0.72), rubber),
    tinted(new CylinderGeometry(0.03, 0.045, 0.07, 7).rotateX(Math.PI / 2).translate(0, -0.075, 0.1), rubber),
    tinted(new CylinderGeometry(0.042, 0.042, 0.08, 8).rotateX(Math.PI / 2).translate(0, -0.085, 0.15), METAL),
    ...[-1, 1].flatMap((side) => [
      tinted(new CylinderGeometry(0.04, 0.04, 0.02, 8).rotateX(Math.PI / 2).translate(side * 0.047, 0.035, 0.072), METAL),
      tinted(new CylinderGeometry(0.031, 0.031, 0.022, 8).rotateX(Math.PI / 2).translate(side * 0.047, 0.035, 0.077), GLASS),
    ]),
  ];
  if (hose) {
    const points = [new Vector3(0, -0.085, 0.16), new Vector3((random() - 0.5) * 0.3, -0.16, 0.24), new Vector3((random() - 0.5) * 0.5, -0.3, 0.05 + random() * 0.2)];
    parts.push(tinted(new TubeGeometry(new CatmullRomCurve3(points), 10, 0.022, 5), 0x121110));
  }
  return mergeGeometries(parts.map(withUv))!;
}

/** Merging needs the same attributes everywhere; plain-colored parts get flat UVs. */
function withUv(geometry: BufferGeometry): BufferGeometry {
  if (!geometry.getAttribute('uv')) geometry.setAttribute('uv', new Float32BufferAttribute(new Array(geometry.getAttribute('position').count * 2).fill(0), 2));
  return geometry;
}

export interface MaskPose {
  position: Vector3;
  rotation: Euler;
}

/** Many masks in given poses as one vertex-colored mesh. */
export function maskPile(kit: LevelKit, poses: readonly MaskPose[], seed: string): MeshBuilder {
  const random = seededRandom(hashString(seed));
  const variants = RUBBER.flatMap((rubber) => [false, false, true].map((hose) => maskGeometry(rubber, hose, random)));
  const placed = poses.map((pose, i) => {
    const variant = variants[(i * 7 + Math.floor(random() * variants.length)) % variants.length]!;
    const scale = 0.9 + random() * 0.2;
    return variant.clone().applyMatrix4(new Matrix4().compose(pose.position, new Quaternion().setFromEuler(pose.rotation), new Vector3(scale, scale, scale)));
  });
  const builder = kit.mesh(mergeGeometries(placed)!);
  builder.mesh.material.dispose();
  builder.mesh.material = createPs1Material({ vertexColors: true });
  return builder;
}

export interface HeapOptions {
  /** Center of the heap on the floor, and its half extents. */
  x: number;
  z: number;
  rx: number;
  rz: number;
  /** Height at the middle. */
  height: number;
  count: number;
  seed: string;
  /** Some masks stare at this point, such as the doorway. */
  lookAt: { x: number; y: number; z: number };
}

/** Height of the heap's surface at (x, z), 0 outside it. */
export function heapSurface(options: HeapOptions, x: number, z: number): number {
  const r2 = ((x - options.x) / options.rx) ** 2 + ((z - options.z) / options.rz) ** 2;
  return r2 >= 1 ? 0 : options.height * (1 - r2) ** 0.8;
}

/** Poses for a waist-high heap: masks lie on and just under the surface, facing every way. */
export function heapPoses(options: HeapOptions): MaskPose[] {
  const random = seededRandom(hashString(options.seed));
  const look = new Vector3(options.lookAt.x, options.lookAt.y, options.lookAt.z);
  return Array.from({ length: options.count }, (_, i) => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 1.08;
    const x = options.x + Math.cos(angle) * radius * options.rx;
    const z = options.z + Math.sin(angle) * radius * options.rz;
    const top = heapSurface(options, x, z);
    const y = Math.max(0.06, top - random() ** 2 * 0.3 + 0.04);
    const position = new Vector3(x, y, z);
    // One mask in six turns its eyepieces toward the door.
    if (i % 6 === 0) {
      const facing = new Matrix4().lookAt(look, position, new Vector3(0, 1, 0));
      return { position, rotation: new Euler().setFromRotationMatrix(facing) };
    }
    return { position, rotation: new Euler(-Math.PI / 2 + (random() - 0.3) * 2.2, random() * Math.PI * 2, (random() - 0.5) * 1.6, 'YXZ') };
  });
}

/** A mask lying on the floor, eyepieces up. */
export function floorMask(x: number, z: number, yaw: number): MaskPose {
  return { position: new Vector3(x, 0.07, z), rotation: new Euler(-Math.PI / 2, (yaw * Math.PI) / 180, 0, 'YXZ') };
}

/** A mask standing upright on a shelf or a hook, facing along `yaw`. */
export function uprightMask(x: number, y: number, z: number, yaw: number, tilt = 0): MaskPose {
  return { position: new Vector3(x, y, z), rotation: new Euler(tilt, (yaw * Math.PI) / 180 + Math.PI, 0, 'YXZ') };
}
