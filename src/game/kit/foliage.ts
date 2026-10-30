import { BoxGeometry, BufferGeometry, CylinderGeometry, Float32BufferAttribute, PlaneGeometry, Quaternion, Vector3 } from 'three';
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

/** Three tall planes crossed at 60 degrees with a whole tree painted on, cut into cells against the affine warp. */
function crossedPicture(w: number, h: number): BufferGeometry {
  const plane = new PlaneGeometry(w, h, 4, 8).translate(0, h / 2, 0);
  return mergeGeometries([0, 1, 2].map((i) => plane.clone().rotateY((i * Math.PI) / 3)))!;
}

/** Sprays and clumps of dead leaves still hanging on, at `tips`, for a bare tree in November. */
function clinging(random: () => number, tips: { at: Vector3; yaw: number }[], share: number): { sprays: Card[]; clumps: Card[] } {
  const kept = tips.filter(() => random() < share);
  return {
    sprays: kept.map(({ at, yaw }) =>
      branchCard({ root: at, along: heading(yaw + (random() - 0.5) * 1.2, -0.5 - random() * 0.5), length: 0.55 + random() * 0.3, width: 0.45, roll: random() * Math.PI, rootAt: 'left', shade: 0.7 + random() * 0.3 }),
    ),
    clumps: kept.filter(() => random() < 0.4).map(({ at }) => uprightCard(at.clone().setY(at.y - 0.15), 0.45, 0.4, random() * Math.PI, 0.6 + random() * 0.3)),
  };
}

export interface BareTreeOptions {
  /** Meters to the top. Default 8, a village lime or walnut; 5 for an orchard tree. */
  height?: number;
  /** Where the trunk forks into limbs. Default 2.6. */
  crownBase?: number;
  /** Crown width against a beech's, 1 narrow, 1.6 a broad walnut or apple. Default 1. */
  spread?: number;
  /** Share of twig tips still holding a few dead leaves, 0 to 1. Default 0.25. */
  leaves?: number;
  ivy?: boolean;
}

/**
 * A broadleaf tree bare for November, a lime, a walnut, an apple: a real trunk and limbs that
 * fork twice, the fine twigs of the whole crown painted on three crossed planes round them, and
 * a few sprays of brown leaves still clinging to the twig ends.
 */
export function bareTree(seed: string, options: BareTreeOptions = {}): TreeModel {
  const { height = 8, crownBase = 2.6, spread = 1, leaves = 0.25 } = options;
  const random = seededRandom(hashString(`bare-${seed}`));
  const girth = 0.12 + height * 0.016;
  const limbs: BufferGeometry[] = [limbGeometry(new Vector3(), UP, height * 0.8, girth, 0.05, 6)];
  const tips: { at: Vector3; yaw: number }[] = [];
  const count = 6 + Math.floor(random() * 3);
  // Limbs stay inside the painted crown, so no bare stick pokes out past its twigs.
  const reach = height * 0.28 * spread;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const root = new Vector3(0, crownBase + t * (height * 0.72 - crownBase), 0);
    const yaw = i * 2.4 + random() * 0.6;
    const along = heading(yaw, 0.6 + t * 0.5 - (spread - 1) * 0.2 + random() * 0.2);
    const length = reach * (1 - 0.5 * t) * (0.75 + random() * 0.3);
    limbs.push(limbGeometry(root, along, length * 0.55, girth * 0.4, girth * 0.22, 4));
    // The outer half bends up toward the light, as a pruned village tree's limbs do.
    const elbow = root.clone().addScaledVector(along, length * 0.55);
    const outer = heading(yaw + (random() - 0.5) * 0.5, 0.7 + random() * 0.4);
    limbs.push(limbGeometry(elbow, outer, length * 0.5, girth * 0.22, 0.015, 3));
    tips.push({ at: elbow.clone().addScaledVector(outer, length * 0.5), yaw });
    const fork = heading(yaw + (random() < 0.5 ? -0.8 : 0.8), 0.3 + random() * 0.4);
    limbs.push(limbGeometry(elbow, fork, length * 0.4, girth * 0.12, 0.01, 3));
    tips.push({ at: elbow.clone().addScaledVector(fork, length * 0.4), yaw: yaw + 0.8 });
  }
  // The painted crown matches the limbs: as tall as the tree, as wide as its reach.
  const twigs = crossedPicture(reach * 2.3, height * 1.04);
  const { sprays, clumps } = clinging(random, tips, leaves);
  const parts: TreePart[] = [
    wood(limbs, 'bark_spruce', 0x5c554c),
    { geometry: twigs, texture: 'tree_beech_bare', uvScale: [1, 1], color: 0x7a7268, cutout: true },
  ];
  if (sprays.length) parts.push(cards('branch_beech', sprays, 0xa08670));
  if (clumps.length) parts.push(cards('leaf_cluster', clumps, 0x8c6a4c));
  if (options.ivy) parts.push(cards('ivy_clump', ivy(random, girth, 2), 0x6c7a5e));
  return { trunkRadius: girth, parts };
}

/** A birch: its white trunk and limbs, and the thin yellowed crown painted on crossed planes round them. */
export function birchTree(seed: string): TreeModel {
  const random = seededRandom(hashString(`birch-${seed}`));
  const height = 7.4;
  const limbs: BufferGeometry[] = [limbGeometry(new Vector3(), UP, height * 0.85, 0.15, 0.04, 6)];
  for (let i = 0; i < 6; i++) {
    const root = new Vector3(0, 2.6 + i * 0.7 + random() * 0.3, 0);
    limbs.push(limbGeometry(root, heading(i * 2.4 + random(), 0.7 + random() * 0.4), 1 + random() * 0.8, 0.045, 0.01, 3));
  }
  return {
    trunkRadius: 0.15,
    parts: [wood(limbs, 'bark_birch', 0xd8d4cc), { geometry: crossedPicture(3.6, height), texture: 'tree_birch', uvScale: [1, 1], color: 0x8a8070, cutout: true }],
  };
}

/**
 * A churchyard yew clipped long ago and left: a dark column, widest a third of the way up and
 * coming to a ragged point, built of needle sprays all reaching up and out from a short trunk.
 */
export function yew(seed: string, options: { height?: number; radius?: number } = {}): TreeModel {
  const { height = 5, radius = 1.1 } = options;
  const random = seededRandom(hashString(`yew-${seed}`));
  const sprays: Card[] = [];
  const levels = Math.round(height / 0.32);
  for (let l = 0; l < levels; l++) {
    const t = l / (levels - 1);
    const y = 0.35 + t * (height - 0.6);
    const reach = radius * (t < 0.33 ? 0.75 + 0.75 * t : 1.35 * (1 - t) ** 0.75) + 0.12;
    const count = 5 + Math.floor(random() * 2) - (t > 0.75 ? 2 : 0);
    for (let b = 0; b < count; b++) {
      const yaw = l * 2.4 + (b * Math.PI * 2) / count + (random() - 0.5) * 0.7;
      const pitch = 0.75 + random() * 0.35;
      sprays.push(
        branchCard({
          root: new Vector3(0, y, 0),
          along: heading(yaw, pitch),
          length: reach / Math.cos(pitch) + 0.15,
          width: 0.55 + reach * 0.35,
          roll: (random() - 0.5) * 1.6,
          rootAt: 'left',
          shade: (0.6 + 0.4 * t) * (0.85 + random() * 0.25),
        }),
      );
    }
  }
  return {
    trunkRadius: 0.2,
    parts: [wood([limbGeometry(new Vector3(), UP, height * 0.7, 0.2, 0.05, 6)], 'bark_spruce', 0x5a4c42), cards('branch_spruce_full', sprays, 0x4c5a46)],
  };
}

/** A plant picture for `thicket`: its texture, size in meters, and tint. */
export interface Plant {
  texture: string;
  w: number;
  h: number;
  color: number;
}

/**
 * A clipped beech hedge left to grow for a season. Beech hedges keep their dead copper leaves
 * all winter; ivy and a little dark green show through. Pictures that fill their width, such as
 * `undergrowth`, would show the straight edge of their card here.
 */
export const HEDGE_PLANTS: readonly Plant[] = [
  { texture: 'leaf_cluster', w: 1.3, h: 1.2, color: 0x8a6a50 },
  { texture: 'bramble', w: 1.6, h: 1.15, color: 0x6a5a50 },
  { texture: 'leaf_cluster', w: 1.1, h: 1.3, color: 0x7a5e46 },
  { texture: 'ivy_clump', w: 0.9, h: 0.9, color: 0x56604c },
  { texture: 'bush', w: 0.9, h: 0.8, color: 0x525a48 },
];

/** A hedge nobody has cut in years: bramble over it, young spruce and dead-leaved saplings through it. */
export const WILD_PLANTS: readonly Plant[] = [
  { texture: 'bramble', w: 2.2, h: 1.6, color: 0x76665c },
  { texture: 'leaf_cluster', w: 1.4, h: 1.6, color: 0x6c5a46 },
  { texture: 'sapling_spruce', w: 1.2, h: 2.5, color: 0x66725f },
  { texture: 'bramble', w: 1.6, h: 1.2, color: 0x6a5a50 },
  { texture: 'ivy_clump', w: 1, h: 1, color: 0x58624c },
];

/** The uncut strip at the foot of a fence or wall: dead grass, bramble, dead fern. */
export const VERGE_PLANTS: readonly Plant[] = [
  { texture: 'grass_tuft', w: 1, h: 0.65, color: 0x86826c },
  { texture: 'grass_tuft', w: 0.8, h: 0.5, color: 0x7a7662 },
  { texture: 'bramble', w: 1.1, h: 0.7, color: 0x6e5e54 },
  { texture: 'grass_tuft', w: 0.9, h: 0.55, color: 0x8a846c },
  { texture: 'fern_dead', w: 0.9, h: 0.65, color: 0x8a806a },
];

/**
 * Upright plant cards stood in a `length` by `depth` patch along X, each paired with a second
 * crossed at a right angle, so the patch has body from every side. One model makes a bush,
 * a stretch of hedge, or a run of verge; deal several seeds along a line for a long one.
 */
export function thicket(seed: string, options: { length: number; depth: number; count: number; plants: readonly Plant[] }): TreeModel {
  const { length, depth, count, plants } = options;
  const random = seededRandom(hashString(`thicket-${seed}`));
  const byTexture = new Map<string, { color: number; list: Card[] }>();
  for (let i = 0; i < count; i++) {
    const plant = plants[i % plants.length]!;
    const size = 0.75 + random() * 0.5;
    const [w, h] = [plant.w * size, plant.h * size];
    const center = new Vector3((random() - 0.5) * length, h / 2 - 0.08 * size, (random() - 0.5) * depth);
    const facing = (random() - 0.5) * 1.2;
    const shade = 0.72 + random() * 0.3;
    const entry = byTexture.get(plant.texture) ?? { color: plant.color, list: [] };
    entry.list.push(uprightCard(center, w, h, facing, shade), uprightCard(center.clone().add(new Vector3(0, -0.04, 0)), w * 0.8, h * 0.95, facing + Math.PI / 2, shade * 0.9));
    byTexture.set(plant.texture, entry);
  }
  return { trunkRadius: depth / 2, parts: [...byTexture].map(([texture, { color, list }]) => cards(texture, list, color)) };
}

/**
 * Ivy up a wall, `w` wide and up to `h` high, its leaves lying against the wall in the XY plane
 * just off it, thick at the foot and thinning to ragged tendrils. Place it with the wall behind
 * its -Z side.
 */
export function ivyCover(seed: string, options: { w: number; h: number }): TreeModel {
  const random = seededRandom(hashString(`ivy-${seed}`));
  const columns = Math.max(2, Math.round(options.w / 0.3));
  const leaves = Array.from({ length: columns }, (_, c) => {
    const x = ((c + 0.5) / columns - 0.5) * options.w;
    const top = options.h * (0.3 + random() * 0.7);
    const start = random() * 0.3;
    return Array.from({ length: Math.max(1, Math.round(top / 0.32)) }, (_, k) => {
      const y = start + k * 0.32 + random() * 0.2;
      const size = (0.5 + random() * 0.3) * (1 - (0.45 * y) / options.h);
      const turn = (random() - 0.5) * 0.8;
      const card = uprightCard(new Vector3(x + (random() - 0.5) * 0.35, y, 0.05 + random() * 0.14), size, size, turn, (0.6 + random() * 0.4) * (1 - (0.25 * y) / options.h));
      return { ...card, normal: new Vector3(Math.sin(-turn), 0.4, 1).normalize() };
    });
  }).flat();
  return { trunkRadius: 0.1, parts: [cards('ivy_clump', leaves, 0x627058)] };
}

/** The models `kit.trees` builds for a stock kind, a few seeds of each so a stand varies. */
export function stockTrees(kind: 'spruce' | 'bare' | 'birch'): TreeModel[] {
  if (kind === 'spruce') return [leafySpruce('stock-a'), leafySpruce('stock-b', { ivy: true }), leafySpruce('stock-c')];
  if (kind === 'bare') return [bareTree('stock-a', { ivy: true }), bareTree('stock-b', { height: 8.6 })];
  return [birchTree('stock-a'), birchTree('stock-b')];
}
