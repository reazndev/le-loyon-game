import { BoxGeometry, BufferGeometry, CylinderGeometry, Float32BufferAttribute, Quaternion, Vector3 } from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hashString, seededRandom } from '../../engine/random';
import type { TreeModel, TreePart } from '../../engine/render/trees';

/**
 * Trees built the PS1 way: a trunk and limbs with many crossed alpha cards of needles and
 * leaves on them, so a crown reads as a mass of branches instead of a solid cone. Each model
 * is a few instanceable parts, one per texture, for `kit.trees`.
 */

/** One alpha-cut quad. `right` and `up` are half the quad along the texture's u and v axes. */
export interface Card {
  center: Vector3;
  right: Vector3;
  up: Vector3;
  /** Multiplies the texture, 0 to 1, so inner and lower cards read as shadowed. */
  shade: number;
  /** The normal used for lighting, the same on both faces. */
  normal: Vector3;
}

const UP = new Vector3(0, 1, 0);

/** The cards as one indexed geometry with a grey vertex color per card for its shade. */
export function cardsGeometry(cards: readonly Card[]): BufferGeometry {
  const corners = [
    [-1, -1, 0, 0],
    [1, -1, 1, 0],
    [1, 1, 1, 1],
    [-1, 1, 0, 1],
  ] as const;
  const position = cards.flatMap((c) =>
    corners.flatMap(([su, sv]) => c.center.clone().addScaledVector(c.right, su).addScaledVector(c.up, sv).toArray()),
  );
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(cards.flatMap((c) => corners.flatMap(() => c.normal.toArray())), 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(cards.flatMap(() => corners.flatMap(([, , u, v]) => [u, v])), 2));
  geometry.setAttribute('color', new Float32BufferAttribute(cards.flatMap((c) => corners.flatMap(() => [c.shade, c.shade, c.shade])), 3));
  geometry.setIndex(cards.flatMap((_, i) => [0, 1, 2, 0, 2, 3].map((k) => i * 4 + k)));
  return geometry;
}

/** Unit vector out from the trunk at `yaw`, tilted up by `pitch` (down when negative). */
export function heading(yaw: number, pitch: number): Vector3 {
  return new Vector3(Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw));
}

/**
 * A card hung from `root` along `along`, `length` long and `width` wide, turned `roll` radians
 * round its own axis (0 lies flat, PI / 2 stands on edge). `rootAt` is the picture's edge that
 * goes at the root: `branch_beech` grows from its left edge, and `branch_spruce` is cut off
 * along its top, an edge best hidden against the trunk.
 */
export function branchCard(options: {
  root: Vector3;
  along: Vector3;
  length: number;
  width: number;
  roll: number;
  rootAt: 'left' | 'right' | 'top';
  shade: number;
}): Card {
  const { root, along, length, width, roll } = options;
  const flat = new Vector3().crossVectors(UP, along);
  if (flat.lengthSq() < 1e-6) flat.set(1, 0, 0);
  flat.normalize();
  const across = flat.applyAxisAngle(along, roll);
  const outward = new Vector3(along.x, 0, along.z).normalize();
  const lengthwise = along.clone().multiplyScalar(length / 2);
  const crosswise = across.multiplyScalar(width / 2);
  return {
    center: root.clone().addScaledVector(along, length / 2),
    right: options.rootAt === 'top' ? crosswise : lengthwise.multiplyScalar(options.rootAt === 'right' ? -1 : 1),
    up: options.rootAt === 'top' ? lengthwise.negate() : crosswise,
    shade: options.shade,
    normal: outward.multiplyScalar(0.6).add(new Vector3(0, 0.8, 0)).normalize(),
  };
}

/** A picture standing upright at `center`, facing `facing` radians round Y. */
export function uprightCard(center: Vector3, w: number, h: number, facing: number, shade: number): Card {
  const right = new Vector3(Math.cos(facing), 0, Math.sin(facing));
  return {
    center,
    right: right.clone().multiplyScalar(w / 2),
    up: new Vector3(0, h / 2, 0),
    shade,
    normal: new Vector3(-right.z, 0.6, right.x).normalize(),
  };
}

/** A tapered round limb from `from` along `direction`, for trunks and boughs. */
export function limbGeometry(from: Vector3, direction: Vector3, length: number, r0: number, r1: number, sides = 5): BufferGeometry {
  const geometry = new CylinderGeometry(r1, r0, length, sides, 1, true).translate(0, length / 2, 0);
  geometry.applyQuaternion(new Quaternion().setFromUnitVectors(UP, direction.clone().normalize()));
  return geometry.translate(from.x, from.y, from.z).toNonIndexed();
}

const cards = (texture: string, list: Card[], color: number): TreePart => ({
  geometry: cardsGeometry(list),
  texture,
  uvScale: [1, 1],
  color,
  cutout: true,
});

const wood = (geometries: BufferGeometry[], texture: string, color: number): TreePart => ({
  geometry: mergeVertices(mergeGeometries(geometries)!),
  texture,
  uvScale: [2, 0.5],
  color,
});

/** Ivy climbing the foot of a trunk: clumps facing out round it, up to `reach` meters. */
function ivy(random: () => number, radius: number, reach: number): Card[] {
  return Array.from({ length: 4 + Math.floor(random() * 3) }, (_, i) => {
    const yaw = i * 1.9 + random();
    const y = 0.35 + random() * reach;
    const size = 0.55 + random() * 0.35;
    const out = new Vector3(Math.cos(yaw), 0, Math.sin(yaw));
    return { ...uprightCard(out.clone().multiplyScalar(radius + 0.04).setY(y), size, size, yaw + Math.PI / 2, 0.75 + random() * 0.25), normal: out.setY(0.4).normalize() };
  });
}

export const SPRUCE_HEIGHT = 10;

/**
 * A Norway spruce about ten meters tall: a bare trunk with dead twigs low down, then whorl on
 * whorl of drooping branches, each a flat card of needles and a hanging one crossed under it,
 * long and dark at the bottom, short and lighter at the top. Grey lichen hangs off some limbs.
 */
export function leafySpruce(seed: string, options: { ivy?: boolean } = {}): TreeModel {
  const random = seededRandom(hashString(`spruce-${seed}`));
  const trunk: BufferGeometry[] = [limbGeometry(new Vector3(), UP, SPRUCE_HEIGHT - 0.3, 0.19, 0.03, 6)];
  // Dead lower twigs, the spruce's own shed branches.
  Array.from({ length: 7 }, (_, i) => {
    const yaw = i * 2.3 + random();
    const length = 0.4 + random() * 0.6;
    trunk.push(new BoxGeometry(length, 0.03, 0.03).translate(length / 2 + 0.1, 0, 0).rotateZ(-0.3 - random() * 0.3).rotateY(-yaw).translate(0, 0.9 + random() * 1.3, 0).toNonIndexed());
  });

  const needles: Card[] = [];
  const lichen: Card[] = [];
  const base = 1.9 + random() * 0.5;
  const top = SPRUCE_HEIGHT - 0.6;
  const whorls = Math.round((top - base) / 0.4);
  for (let w = 0; w <= whorls; w++) {
    const t = w / whorls;
    const y = base + (top - base) * t + (random() - 0.5) * 0.12;
    const count = 4 + Math.floor(random() * 2) - (t > 0.8 ? 1 : 0);
    for (let b = 0; b < count; b++) {
      const yaw = w * 2.4 + (b * Math.PI * 2) / count + (random() - 0.5) * 0.6;
      const length = (0.35 + 2.05 * (1 - t) ** 0.85) * (0.8 + random() * 0.4);
      const along = heading(yaw, -0.2 - 0.4 * (1 - t) - random() * 0.15);
      const root = new Vector3(0, y, 0);
      // Lower and inner needles in shadow, the tips at the top catching the sky.
      const shade = (0.62 + 0.38 * t) * (0.85 + random() * 0.25);
      // Long branches in two pieces that droop more toward the tip, each piece two cards crossed
      // in an X along it, so the branch has body from the side and from below.
      const pieces = length > 1.1 ? 2 : 1;
      let from = root;
      for (let k = 0; k < pieces; k++) {
        const piece = length / pieces;
        const dir = heading(yaw + (random() - 0.5) * 0.3, -0.2 - 0.4 * (1 - t) - k * 0.3 - random() * 0.15);
        const roll = 0.55 + random() * 0.3;
        const width = piece * 1.2 + 0.25;
        const lit = shade * (1 + k * 0.12);
        needles.push(branchCard({ root: from, along: dir, length: piece * 1.25, width, roll, rootAt: 'top', shade: lit }));
        needles.push(branchCard({ root: from, along: dir, length: piece * 1.15, width: width * 0.9, roll: -roll, rootAt: 'top', shade: lit * 0.88 }));
        from = from.clone().addScaledVector(dir, piece);
      }
      if (t < 0.55 && random() < 0.12) {
        const at = root.clone().addScaledVector(along, length * (0.4 + random() * 0.4));
        const h = 0.7 + random() * 0.6;
        lichen.push(uprightCard(at.setY(at.y - h / 2 + 0.05), h * 0.5, h, yaw + Math.PI / 2, 0.8 + random() * 0.2));
      }
    }
  }
  // The leader: three sprays pointing up out of the top whorl.
  [0, 2.1, 4.2].forEach((yaw) =>
    needles.push(branchCard({ root: new Vector3(0, top - 0.3, 0), along: heading(yaw, 1.25), length: 1.3, width: 1.1, roll: 0, rootAt: 'top', shade: 0.95 })),
  );

  const parts = [wood(trunk, 'bark_spruce', 0x8f8478), cards('branch_spruce', needles, 0x8a9884), cards('hanging_lichen', lichen, 0xa8ac9c)];
  if (options.ivy) parts.push(cards('ivy_clump', ivy(random, 0.17, 2.2), 0x6c7a5e));
  return { trunkRadius: 0.2, parts };
}

/**
 * A beech in November: a smooth grey trunk forking into rising limbs, the lower ones still
 * holding sprays of copper leaves, the crown thin and brown above, ivy up the foot, lichen off
 * a few limbs. `lean` tips the whole tree toward +X by that many radians, for trees that grow
 * out over a trail toward the light.
 */
export function leafyBeech(seed: string, options: { ivy?: boolean; lean?: number } = {}): TreeModel {
  const random = seededRandom(hashString(`beech-${seed}`));
  const height = 8.5;
  const limbs: BufferGeometry[] = [limbGeometry(new Vector3(), UP, height, 0.22, 0.05, 6)];
  const sprays: Card[] = [];
  const clumps: Card[] = [];
  const lichen: Card[] = [];
  const count = 8 + Math.floor(random() * 3);
  // A leaning tree keeps its crown higher, so it closes over a trail above head height.
  const crownBase = options.lean ? 4.2 : 2.8;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = crownBase + t * (height - 0.8 - crownBase);
    const yaw = i * 2.4 + random() * 0.6;
    const length = (2.6 - 1.4 * t) * (0.8 + random() * 0.4);
    const along = heading(yaw, 0.35 + t * 0.5 + random() * 0.2);
    const root = new Vector3(0, y, 0);
    limbs.push(limbGeometry(root, along, length, 0.07, 0.02, 4));
    // Two forks off each limb, with sprays of leaves hung along them.
    [-0.7, 0.7].forEach((turn) => {
      const fork = heading(yaw + turn + (random() - 0.5) * 0.4, 0.1 + random() * 0.4 - t * 0.1);
      const from = root.clone().addScaledVector(along, length * 0.55);
      limbs.push(limbGeometry(from, fork, length * 0.6, 0.03, 0.01, 3));
      const shade = (0.75 + 0.25 * t) * (0.85 + random() * 0.3);
      [0.1, 0.35, 0.6].forEach((f, k) =>
        sprays.push(
          branchCard({
            root: from.clone().addScaledVector(fork, length * f),
            along: heading(yaw + turn * (1 - k * 0.3) + (random() - 0.5) * 0.6, -0.3 - random() * 0.4),
            length: 0.75 + random() * 0.35,
            width: 0.6,
            roll: k % 2 ? Math.PI / 2 : (random() - 0.5) * 0.9,
            rootAt: 'left',
            shade: shade * (0.9 + k * 0.06),
          }),
        ),
      );
    });
    [0.75, 1].forEach((f) => {
      const size = 0.65 + random() * 0.45;
      const at = root.clone().addScaledVector(along, length * f);
      clumps.push(uprightCard(at, size, size * 0.85, random() * Math.PI, (0.65 + 0.3 * t) * (0.85 + random() * 0.3)));
      clumps.push(uprightCard(at.clone().add(new Vector3(0, 0.1, 0)), size * 0.9, size * 0.8, random() * Math.PI, 0.7 + random() * 0.3));
    });
    if (random() < 0.35) {
      const h = 0.8 + random() * 0.7;
      lichen.push(uprightCard(root.clone().addScaledVector(along, length * 0.8).add(new Vector3(0, -h / 2, 0)), h * 0.5, h, yaw + Math.PI / 2, 0.85));
    }
  }
  const parts = [wood(limbs, 'bark_birch', 0x56544e), cards('branch_beech', sprays, 0xb09c88), cards('leaf_cluster', clumps, 0xa07a54), cards('hanging_lichen', lichen, 0xa8ac9c)];
  if (options.ivy) parts.push(cards('ivy_clump', ivy(random, 0.2, 2.6), 0x6c7a5e));
  if (options.lean) parts.forEach((part) => part.geometry.rotateZ(-options.lean!));
  return { trunkRadius: 0.22, parts };
}
