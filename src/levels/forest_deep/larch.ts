import { BoxGeometry, CylinderGeometry, Euler, Matrix4, PlaneGeometry, Quaternion, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hashString, seededRandom } from '../../engine/random';
import type { LevelKit } from '../../game/kit/levelKit';

export const LARCH_HEIGHT = 19;
/** Where the lowest limbs start, just over head height, so the crown hangs round the player. */
const CROWN_BASE = 2.9;
export const CROWN_RADIUS = 4.4;
/** The `tree_larch` picture, 128 by 262 px, stood up at the tree's full height. */
const PICTURE = { w: (LARCH_HEIGHT * 1.02 * 128) / 262, h: LARCH_HEIGHT * 1.02 };

export interface Branch {
  /** Height on the trunk. */
  y: number;
  /** Direction round the trunk, in radians. */
  yaw: number;
  length: number;
  /** How far the outer half bends down, in radians. */
  droop: number;
}

export interface Card {
  x: number;
  y: number;
  z: number;
  size: number;
  yaw: number;
  tilt: number;
}

const RISE = 0.12;

/**
 * The limbs of the larch, low to high. Long and drooping near the bottom, short at the top, so
 * the crown is a tall spire and the tree reads apart from the spruces by its outline alone.
 */
export function larchBranches(seed: string): Branch[] {
  const random = seededRandom(hashString(seed));
  const tiers = Math.floor((LARCH_HEIGHT - 1.2 - CROWN_BASE) / 0.5);
  return Array.from({ length: tiers }, (_, i) => i).flatMap((i) => {
    const t = i / (tiers - 1);
    const y = CROWN_BASE + i * 0.5 + random() * 0.2;
    return Array.from({ length: 3 }, (_, k) => ({
      y,
      yaw: i * 2.4 + (k * 2 * Math.PI) / 3 + (random() - 0.5) * 0.8,
      length: (0.5 + (CROWN_RADIUS - 0.5) * (1 - t) ** 0.8) * (0.75 + random() * 0.3),
      droop: 0.4 + random() * 0.35,
    }));
  });
}

const direction = (yaw: number, pitch: number) => new Vector3(Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.sin(yaw));

/** The point `f` of the way out along a limb: rising to its elbow, then bending down. */
function along(branch: Branch, f: number): Vector3 {
  const root = new Vector3(0, branch.y, 0);
  if (f <= 0.5) return direction(branch.yaw, RISE).multiplyScalar(f * branch.length).add(root);
  return direction(branch.yaw, -branch.droop)
    .multiplyScalar((f - 0.5) * branch.length)
    .add(along(branch, 0.5));
}

/**
 * Clumps of needles hung along each limb from its middle to its tip, larger on the long low
 * limbs, each turned its own way so the crown is full from every side.
 */
export function needleCards(branches: Branch[], seed: string): Card[] {
  const random = seededRandom(hashString(seed));
  return branches.flatMap((branch) =>
    [0.4, 0.7, 1].map((f) => {
      const p = along(branch, f);
      const size = 0.9 + 1.1 * (branch.length / CROWN_RADIUS) + random() * 0.4;
      return { x: p.x, y: p.y - size * 0.15, z: p.z, size, yaw: random() * Math.PI, tilt: (random() - 0.5) * 0.6 };
    }),
  );
}

function placed(geometry: BufferGeometry, at: Vector3, rotation: Euler): BufferGeometry {
  return geometry.applyMatrix4(new Matrix4().compose(at, new Quaternion().setFromEuler(rotation), new Vector3(1, 1, 1))).toNonIndexed();
}

/** A limb out from the trunk, then bent down at its middle. Thicker on the long low limbs. */
function limb(branch: Branch): BufferGeometry[] {
  const half = branch.length / 2;
  const thick = 0.05 + 0.07 * (branch.length / CROWN_RADIUS);
  return [
    placed(new BoxGeometry(half, thick, thick).translate(half / 2, 0, 0), along(branch, 0), new Euler(0, branch.yaw, RISE, 'YZX')),
    placed(new BoxGeometry(half, thick * 0.6, thick * 0.6).translate(half / 2, 0, 0), along(branch, 0.5), new Euler(0, branch.yaw, -branch.droop, 'YZX')),
  ];
}

const card = (c: Card) => placed(new PlaneGeometry(c.size, c.size), new Vector3(c.x, c.y, c.z), new Euler(c.tilt, c.yaw, 0, 'YXZ'));

/**
 * Rust-gold in a forest of black spruce, taller and broader than all of them: a thick trunk,
 * the whole tree painted on three crossed planes so its outline holds from every side, and real
 * limbs hung with clumps of yellowed needles that the player walks in under.
 */
export function larch(kit: LevelKit, at: { x: number; z: number }): void {
  const branches = larchBranches('larch');
  // Cut into cells, as the kit does, so the affine warp does not slide the painted trunk sideways.
  const picture = new PlaneGeometry(PICTURE.w, PICTURE.h, 8, 16).translate(0, PICTURE.h / 2, 0);
  kit
    .group((g) => {
      g.mesh(new CylinderGeometry(0.1, 0.48, LARCH_HEIGHT, 8, 10).translate(0, LARCH_HEIGHT / 2, 0)).texture('bark_spruce', { tile: [1.2, 2] }).color(0x7a6656);
      g.mesh(mergeGeometries(branches.flatMap(limb))!).texture('bark_spruce', { tile: 0.6 }).color(0x5e4a3a);
      g.mesh(mergeGeometries([0, 60, 120].map((deg) => placed(picture.clone(), new Vector3(), new Euler(0, (deg * Math.PI) / 180, 0))))!)
        .texture('tree_larch', { tile: 1 })
        .cutout()
        .doubleSided();
      g.mesh(mergeGeometries(needleCards(branches, 'larch').map(card))!)
        .texture('leaf_cluster', { tile: 1 })
        .color(0xe09850)
        .emissive(0x180c02)
        .cutout()
        .doubleSided();
    })
    .at(at.x, -0.2, at.z)
    .onGround();
  kit.barrier({ w: 0.95, d: 0.95 }).at(at.x, 0, at.z);
}
