import { BoxGeometry, RepeatWrapping, type CanvasTexture, CylinderGeometry, Euler, Matrix4, PlaneGeometry, Quaternion, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hashString, seededRandom } from '../../engine/random';
import type { LevelKit } from '../../game/kit/levelKit';
import { paintedTexture } from '../forest_path/scrawl';

export const LARCH_HEIGHT = 17;
/** Where the lowest limbs start; below that the trunk is bare, as on an old forest larch. */
const CROWN_BASE = 2.3;
const CROWN_RADIUS = 2.8;

export interface Branch {
  /** Height on the trunk. */
  y: number;
  /** Direction round the trunk, in radians. */
  yaw: number;
  length: number;
  /** How far the outer half bends down, in radians. */
  droop: number;
}

/**
 * The limbs of the larch, low to high. Long and drooping near the bottom, short at the top, so
 * the crown is a narrow spire and the tree reads apart from the spruces by its outline alone.
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
      length: (0.35 + (CROWN_RADIUS - 0.35) * (1 - t) ** 0.9) * (0.75 + random() * 0.3),
      droop: 0.5 + random() * 0.45,
    }));
  });
}

function placed(geometry: BufferGeometry, at: Vector3, rotation: Euler): BufferGeometry {
  return geometry.applyMatrix4(new Matrix4().compose(at, new Quaternion().setFromEuler(rotation), new Vector3(1, 1, 1)));
}

/** A limb out from the trunk, then bent down at its middle. Points along +X before turning. */
function limb(branch: Branch): BufferGeometry {
  const half = branch.length / 2;
  const root = new Vector3(0, branch.y, 0);
  const rise = 0.12;
  const inner = new BoxGeometry(half, 0.045, 0.045).translate(half / 2, 0, 0);
  const outer = new BoxGeometry(half, 0.025, 0.025).translate(half / 2, 0, 0);
  const elbow = new Vector3(half * Math.cos(rise), half * Math.sin(rise), 0);
  return mergeGeometries([
    placed(inner, root, new Euler(0, branch.yaw, rise, 'YZX')),
    placed(outer, elbow.applyEuler(new Euler(0, branch.yaw, 0)).add(root), new Euler(0, branch.yaw, -branch.droop, 'YZX')),
  ])!;
}

/** The thin twigs that hang from the outer half of a limb, as a ragged curtain. */
function curtain(branch: Branch): BufferGeometry {
  const half = branch.length / 2;
  const drop = 0.6 + branch.length * 0.3;
  const elbow = new Vector3(half, half * 0.12, 0).applyEuler(new Euler(0, branch.yaw, 0));
  const width = half * 1.1;
  const sheet = new PlaneGeometry(width, drop).translate(width / 2, -drop / 2, 0);
  // Across in meters, so strands keep their spacing; down once per sheet, so they hang from the limb.
  const uv = sheet.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * width);
  return placed(sheet, elbow.add(new Vector3(0, branch.y, 0)), new Euler(0, branch.yaw, -branch.droop * 0.5, 'YZX')).toNonIndexed();
}

/** Hanging twigs with their last needles, rust and old gold, on a transparent canvas. */
function strands(): CanvasTexture {
  const random = seededRandom(hashString('larch-strands'));
  const colors = ['#c8902c', '#a86a24', '#d8a440', '#6a4a2c'];
  const texture = paintedTexture([32, 32], (c) =>
    Array.from({ length: 22 }, () => ({ x: Math.floor(random() * 32), length: 10 + random() * 22, color: colors[Math.floor(random() * colors.length)]! })).forEach((s) => {
      c.fillStyle = s.color;
      for (let y = 0; y < s.length; y++) c.fillRect(s.x + Math.floor(y / 14), y, 1, 1);
      c.fillRect(s.x - 1, Math.floor(s.length * 0.6), 3, 2);
    }),
  );
  texture.wrapS = RepeatWrapping;
  return texture;
}

/**
 * Bare and rust-gold in a forest of black spruce, taller than all of them. A thin trunk, short
 * dark limbs that droop, and rags of yellowed needles still hanging from them, so it reads by
 * shape and color at the edge of the fog.
 */
export function larch(kit: LevelKit, at: { x: number; z: number }): void {
  const branches = larchBranches('larch');
  kit.group((g) => {
    g.mesh(new CylinderGeometry(0.05, 0.3, LARCH_HEIGHT, 7, 8).translate(0, LARCH_HEIGHT / 2, 0)).texture('bark_spruce', { tile: [1, 2] }).color(0x7a6450);
    g.mesh(mergeGeometries(branches.map(limb).map((b) => b.toNonIndexed()))!).texture('bark_spruce', { tile: 0.5 }).color(0x5a4636);
    g.mesh(mergeGeometries(branches.map(curtain))!)
      .map(strands(), { tile: [0.5, 1] })
      .emissive(0x1e0e02)
      .cutout()
      .doubleSided();
  })
    .at(at.x, -0.2, at.z)
    .onGround();
  kit.barrier({ w: 0.6, d: 0.6 }).at(at.x, 0, at.z);
}
