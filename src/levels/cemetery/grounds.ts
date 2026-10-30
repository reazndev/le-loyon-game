import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import type { SceneContext } from '../../game/scene';
import { billboards, rock, undergrowth } from '../forest_path/woods';
import {
  BACK_GATE,
  BED_LENGTH,
  bedOf,
  graves,
  inside,
  SHED,
  BACK_Z,
  BIN,
  CHASSOT_BEDS,
  CROSS_PATH_WIDTH,
  CROSS_PATHS,
  EAST_X,
  FRONT_GATE,
  FRONT_Z,
  GROUNDS,
  OLD_STONES,
  PATH_WIDTH,
  ROWS,
  TAP,
  WALL_HEIGHT,
  WEST_X,
  type Rect,
} from './layout';

/** The hilltop around the walls: flat close by, falling away to the village, rising into the forest. */
export function hillHeight(x: number, z: number): number {
  const out = Math.max(Math.abs(x - GROUNDS.x) - GROUNDS.w / 2, Math.abs(z - GROUNDS.z) - GROUNDS.d / 2, 0);
  const swell = 0.25 * Math.sin(x * 0.19 + 0.7) * Math.cos(z * 0.23 - 0.3);
  if (z < BACK_Z) return 0.045 * Math.max(0, out - 3) ** 1.15 + swell * Math.min(1, Math.max(0, out - 4) / 4);
  if (z > FRONT_Z) return -0.075 * Math.max(0, out - 3) ** 1.2 + swell * Math.min(1, Math.max(0, out - 5) / 4);
  return -0.05 * Math.max(0, out - 3) + swell * Math.min(1, Math.max(0, out - 4) / 4);
}

/** Splits `outer` into up to four rectangles that leave `gap` uncovered. */
export function around(outer: Rect, gap: Rect): Rect[] {
  const [ox0, ox1, oz0, oz1] = [outer.x - outer.w / 2, outer.x + outer.w / 2, outer.z - outer.d / 2, outer.z + outer.d / 2];
  const [gx0, gx1, gz0, gz1] = [gap.x - gap.w / 2, gap.x + gap.w / 2, gap.z - gap.d / 2, gap.z + gap.d / 2];
  const rect = (x0: number, x1: number, z0: number, z1: number): Rect => ({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 });
  return [rect(ox0, ox1, oz0, gz0), rect(ox0, ox1, gz1, oz1), rect(ox0, gx0, gz0, gz1), rect(gx1, ox1, gz0, gz1)].filter((r) => r.w > 0.01 && r.d > 0.01);
}

/**
 * The floor inside the walls: wet grass everywhere except Marc's bed, which gets its own ground so
 * a hole can open there, and gravel paths from gate to gate and along each row.
 */
export function floor(kit: LevelKit): void {
  around(GROUNDS, CHASSOT_BEDS.marc).forEach((r) =>
    kit.plane({ w: r.w, d: r.d, cell: 0.8 }).texture('grass_dead', { tile: 2.2 }).color(0x7e8270).at(r.x, 0, r.z).walkable('grass'),
  );
  // Tufts of long wet grass where nobody walks.
  const onPath = (x: number, z: number) => Math.abs(x) < PATH_WIDTH / 2 + 0.3 || CROSS_PATHS.some((p) => Math.abs(z - p) < CROSS_PATH_WIDTH / 2 + 0.2);
  const onGrave = (x: number, z: number) => graves.some((g) => inside({ ...bedOf(g), z: bedOf(g).z - 0.35, d: BED_LENGTH + 0.8 }, x, z, 0.15));
  const tufts = scatter({ x: 0, z: 0, w: GROUNDS.w - 1, d: GROUNDS.d - 1, count: 150, seed: 'cemetery-tufts', spacing: 0.9, scale: [0.6, 1.1], avoid: (x, z) => onPath(x, z) || onGrave(x, z) || inside(SHED, x, z, 0.4) });
  billboards(kit, { texture: 'grass_tuft', w: 0.7, h: 0.45, color: 0x6e705c, sink: 0 }, tufts);
  const pathEnd = ROWS[4] + 1.2;
  const pathLength = FRONT_Z + 6 - pathEnd;
  kit
    .plane({ w: PATH_WIDTH, d: pathLength, cell: 0.75 })
    .texture('gravel_path', { tile: 1.8 })
    .color(0x8e8a80)
    .at(0, 0.02, pathEnd + pathLength / 2)
    .walkable('gravel');
  CROSS_PATHS.forEach((z) =>
    kit.plane({ w: GROUNDS.w - 0.6, d: CROSS_PATH_WIDTH, cell: 0.75 }).texture('gravel_path', { tile: 1.8 }).color(0x86837a).at(0, 0.015, z).walkable('gravel'),
  );
  // The worn track from the back row to the back gate.
  kit.plane({ w: 1.2, d: 4.6, cell: 0.6 }).texture('mud', { tile: 1.6 }).color(0x6a655c).at(BACK_GATE.x, 0.018, BACK_Z + 2.3).walkable('gravel');
}

/** The ground outside the walls, in four pieces around the grounds so none of it shows inside. */
export function hill(kit: LevelKit, night: boolean): void {
  const outer: Rect = { x: 0, z: 0, w: 110, d: 100 };
  const inner: Rect = { ...GROUNDS, w: GROUNDS.w, d: GROUNDS.d };
  around(outer, inner).forEach((r) =>
    kit
      .terrain({ w: r.w, d: r.d, cell: 1.5, height: (x, z) => hillHeight(x + r.x, z + r.z) })
      .texture(r.z < BACK_Z ? 'forest_floor' : 'grass_dead', { tile: 3.5 })
      .color(r.z < BACK_Z ? 0x8a857c : 0x86887a)
      .at(r.x, 0, r.z)
      .walkable('grass'),
  );
  // The gravel path down to the village from the front gate, bending east as it drops.
  [
    [0, FRONT_Z + 4, 0],
    [0.6, FRONT_Z + 11, -6],
    [2.2, FRONT_Z + 18, -14],
    [4.6, FRONT_Z + 25, -18],
  ].forEach(([x, z, yaw]) =>
    kit.plane({ w: 1.9, d: 7.6, cell: 0.8 }).texture('gravel_path', { tile: 1.8 }).color(0x868278).at(x!, 0.04, z!).rotY(yaw!).onGround(),
  );

  const nearWalls = (x: number, z: number) => Math.abs(x) < GROUNDS.w / 2 + 2.5 && Math.abs(z) < GROUNDS.d / 2 + 2.5;
  const backStrip = (x: number, z: number) => x > BACK_GATE.x - 7 && x < BACK_GATE.x + 6 && z > BACK_Z - 9;
  const spruce = scatter({ x: 0, z: BACK_Z - 22, w: 104, d: 42, count: 260, seed: 'cemetery-spruce', spacing: 2.2, scale: [0.95, 1.45], avoid: (x, z) => nearWalls(x, z) || backStrip(x, z) });
  // Card spruce within sight of the walls, pictures of spruce past them in the fog.
  const near = (x: number, z: number) => Math.abs(x) < GROUNDS.w / 2 + 14 && z > BACK_Z - 16;
  kit.trees('spruce', spruce.filter((s) => near(s.x, s.z))).collider().shade(0.12);
  billboards(kit, { texture: 'tree_spruce', w: 4.6, h: 9.6, color: 0x6c7468 }, spruce.filter((s) => !near(s.x, s.z)));
  // A few bare trees down the slopes, so the fog has shapes in it.
  kit.trees('bare', scatter({ x: 0, z: 18, w: 104, d: 60, count: 14, seed: 'cemetery-bare', spacing: 9, avoid: (x, z) => nearWalls(x, z) || Math.abs(x - 2) < 6 })).collider().shade(0.12);
  undergrowth(kit, { x: 0, z: BACK_Z - 9, w: 60, d: 14 }, { seed: 'cemetery', count: 90, avoid: (x, z) => nearWalls(x, z) || (Math.abs(x - BACK_GATE.x) < 1 && z > BACK_Z - 9) });
  [
    [-13, BACK_Z - 5, 0.55],
    [-2.5, BACK_Z - 6.5, 0.45],
    [24, 6, 0.6],
    [-25, -3, 0.5],
  ].forEach(([x, z, size], i) => rock(kit, x!, z!, size!, `cemetery-rock-${i}`));
  if (!night) kit.sprite('tree_spruce', { w: 5, h: 12 }).color(0x5a6058).at(-30, 0, BACK_Z - 30).onGround();
}

/** A run of wall from (x0, z) to (x1, z), or along x when `alongZ`. */
function wallRun(kit: LevelKit, from: number, to: number, at: number, alongZ = false): void {
  const length = to - from;
  const mid = (from + to) / 2;
  const [x, z] = alongZ ? [at, mid] : [mid, at];
  kit
    .box({ w: length, h: WALL_HEIGHT, d: 0.5, cell: 0.8 })
    .texture('stone_wall', { tile: 1.6 })
    .color(0x8c8a82)
    .at(x, 0, z)
    .rotY(alongZ ? 90 : 0)
    .collider();
  // Moss along the top.
  kit
    .box({ w: length, h: 0.06, d: 0.58 })
    .texture('moss_rock', { tile: 1 })
    .color(0x56604a)
    .at(x, WALL_HEIGHT, z)
    .rotY(alongZ ? 90 : 0);
}

function pillar(kit: LevelKit, x: number, z: number, h = 1.65): void {
  kit.box({ w: 0.55, h, d: 0.6 }).texture('stone_wall', { tile: 1 }).color(0x96938a).at(x, 0, z).collider();
  kit.box({ w: 0.68, h: 0.12, d: 0.72 }).texture('stone_wall', { tile: 1 }).color(0x7e7c75).at(x, h, z);
}

/** One iron gate leaf hung from a hinge, as a group that turns around the hinge. */
export function gateLeaf(kit: LevelKit, hingeX: number, z: number, width: number, height: number, side: 1 | -1) {
  return kit
    .group((g) => {
      g.box({ w: width, h: height, d: 0.03 })
        .texture('iron_fence', { tile: [width, height] })
        .cutout()
        .doubleSided()
        .color(0x5e5852)
        .at((side * width) / 2, 0.08, 0);
      g.box({ w: width, h: 0.05, d: 0.05 }).texture('rust_metal').color(0x463f3a).at((side * width) / 2, height + 0.06, 0);
    })
    .at(hingeX, 0, z);
}

/** The waist-high wall with the front gate to the village and the narrow back gate to the forest. */
export function walls(kit: LevelKit): void {
  const frontGap = FRONT_GATE.w / 2 + 0.3;
  wallRun(kit, WEST_X - 0.25, -frontGap, FRONT_Z);
  wallRun(kit, frontGap, EAST_X + 0.25, FRONT_Z);
  const backGap = BACK_GATE.w / 2 + 0.3;
  wallRun(kit, WEST_X - 0.25, BACK_GATE.x - backGap, BACK_Z);
  wallRun(kit, BACK_GATE.x + backGap, EAST_X + 0.25, BACK_Z);
  wallRun(kit, BACK_Z, FRONT_Z, WEST_X, true);
  wallRun(kit, BACK_Z, FRONT_Z, EAST_X, true);

  pillar(kit, -frontGap + 0.27, FRONT_Z);
  pillar(kit, frontGap - 0.27, FRONT_Z);
  pillar(kit, BACK_GATE.x - backGap + 0.27, BACK_Z, 1.4);
  pillar(kit, BACK_GATE.x + backGap - 0.27, BACK_Z, 1.4);
  // The front gate: one leaf shut, the other pushed open into the grounds.
  const leaf = FRONT_GATE.w / 2 - 0.02;
  gateLeaf(kit, FRONT_GATE.x + FRONT_GATE.w / 2, FRONT_Z, leaf, 1.45, -1);
  gateLeaf(kit, FRONT_GATE.x - FRONT_GATE.w / 2, FRONT_Z, leaf, 1.45, 1).rotY(-75);
}

/** The tap with its green watering can on a chain, and the bin for dead flowers. */
export function tapAndBin(kit: LevelKit): void {
  kit.group((g) => {
    g.box({ w: 0.14, h: 0.95, d: 0.14 }).texture('stone_wall', { tile: 0.6 }).color(0x8a8780).collider();
    g.cylinder({ r: 0.025, h: 0.16, sides: 5 }).color(0x6a6458).at(0, 0.8, -0.1);
    g.cylinder({ r: 0.12, h: 0.24, sides: 7 }).color(0x3e5a3c).at(0.05, 0, -0.26);
    g.box({ w: 0.03, h: 0.03, d: 0.22 }).color(0x3e5a3c).at(0.05, 0.18, -0.44);
    g.box({ w: 0.012, h: 0.5, d: 0.012 }).color(0x4a443e).at(0.03, 0.3, -0.12);
  })
    .at(TAP.x, 0, TAP.z)
    .rotY(180);
  kit.group((g) => {
    g.box({ w: 0.6, h: 0.7, d: 0.45 }).texture('rust_metal', { tile: 0.8 }).color(0x4a5244).collider();
    g.box({ w: 0.5, h: 0.08, d: 0.35 }).color(0x4e3e30).at(0, 0.66, 0);
    g.box({ w: 0.1, h: 0.18, d: 0.06 }).color(0x6a5a3c).at(0.12, 0.7, 0.05).rotY(30);
  }).at(BIN.x, 0, BIN.z);
}

/** The five old stones from the 1800s, set into the inside of the west wall, and readable. */
export function oldStones(kit: LevelKit, ctx: SceneContext): void {
  OLD_STONES.forEach(({ doc, x, z }, i) => {
    const h = 0.85 + (i % 2) * 0.2;
    kit.box({ w: 0.7, h, d: 0.1 }).texture('gravestone_sandstone', { tile: 0.9 }).color(i === 3 ? 0x7a7466 : 0x8e8676).at(x, 0.05, z).rotY(90);
    kit.hotspot({ prompt: 'Read the old stone', radius: 0.6, onInteract: () => ctx.readDocument(doc) }).at(x + 0.3, 0, z);
  });
}
