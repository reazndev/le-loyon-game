import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { cowbell } from '../../engine/characters/voices';
import { cylinderGeometry, spriteGeometry } from '../../engine/render/geometry';
import { hashString, seededRandom } from '../../engine/random';
import type { Atmosphere } from '../../engine/render/atmosphere';
import { createPs1Material } from '../../engine/render/ps1Material';
import type { MeshBuilder, TreeSpot } from '../../game/kit/builders';
import { leafyBeech, leafySpruce } from '../../game/kit/foliage';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import type { SceneContext } from '../../game/scene';
import type { TimeOfDay } from '../../game/state';
import { around, breathVapor, caw, distantDog, distantTraffic, drizzle, fallingLeaves, fogWisps, hourBells, loop, nowAndThen, particles, weather, windInTrees, windSway } from '../../game/ambient';
import { rain, waterDrop } from '../../game/ambient/sounds';
import { distanceToTrails, nearestOnTrails, resample, type Trail } from './trail';
import { wildlife } from '../../game/ambient/wildlife';

/** Building blocks shared by every Bois-Noir scene: ground, path, trees, undergrowth, sound. */

export interface Area {
  x: number;
  z: number;
  w: number;
  d: number;
}

export type Height = (x: number, z: number) => number;

/** Grey forest fog by day; at night only the torch shows anything. */
export const forestAtmosphere: Record<TimeOfDay, Atmosphere> = {
  day: {
    fog: { color: 0x7f857f, near: 0.8, far: 13, density: 0.1, wisps: 0.55 },
    ambient: 0x5c5e58,
    sun: { color: 0x464742, direction: [0.3, 1, 0.45] },
    saturation: 0.58,
  },
  night: {
    fog: { color: 0x06090d, near: 0.3, far: 10, density: 0.3, wisps: 0.65 },
    ambient: 0x03050a,
    sun: { color: 0x05060a, direction: [-0.4, 1, 0.3] },
    saturation: 0.75,
  },
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * Uneven forest ground over a smooth slope. `calm` gives the distance in meters to the nearest
 * trail or clearing; the bumps ease out toward it so paths stay walkable.
 */
export function woodsHeight(slope: Height, calm: Height): Height {
  return (x, z) => {
    const bumps =
      0.55 * Math.sin(x * 0.21 + 1.3) * Math.cos(z * 0.17 - 0.4) +
      0.32 * Math.sin(x * 0.53 - z * 0.41) +
      0.16 * Math.sin(x * 1.31 + z * 0.97);
    const away = clamp01((calm(x, z) - 1.3) / 3.5);
    return slope(x, z) + bumps * away;
  };
}

/** The walkable forest floor over an area. */
export function forestFloor(kit: LevelKit, area: Area, height: Height): void {
  kit
    .terrain({ w: area.w, d: area.d, cell: 1.5, height: (x, z) => height(x + area.x, z + area.z) })
    .texture('forest_floor', { tile: 3.5 })
    .color(0x9a948a)
    .at(area.x, 0, area.z)
    .walkable('grass');
}

/** The trail as a strip of darker, trodden earth with ragged edges, laid over the terrain. */
export function trailStrip(kit: LevelKit, trail: Trail, width: number, height: Height): void {
  const points = resample(trail, 0.8);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  points.forEach((p, i) => {
    const prev = points[Math.max(0, i - 1)]!;
    const next = points[Math.min(points.length - 1, i + 1)]!;
    const length = Math.hypot(next.x - prev.x, next.z - prev.z) || 1;
    const [lx, lz] = [-(next.z - prev.z) / length, (next.x - prev.x) / length];
    const ragged = (side: number) => (width / 2) * (1 + 0.28 * Math.sin(p.along * 1.7 + side * 2.3) * Math.cos(p.along * 0.61));
    [-1, 1].forEach((side) => {
      const half = ragged(side);
      const x = p.x + lx * half * side;
      const z = p.z + lz * half * side;
      positions.push(x, height(x, z) + 0.05, z);
      uvs.push(half * side, p.along);
    });
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // A step lighter than the forest floor, so the torch finds the trail's edge at night.
  kit.mesh(geometry).texture('mud', { tile: 2.2 }).color(0x867e72).doubleSided();
}

export interface WoodlandOptions {
  area: Area;
  seed: string;
  /** Return true to keep a spot free of trees. */
  avoid: (x: number, z: number) => boolean;
  spruce: number;
  beech?: number;
  birch?: number;
  /**
   * Where trees are solid models. Past it they are flat pictures, cheap enough to fill the fog
   * with trunk after trunk. Omit to make every tree a model.
   */
  near?: (x: number, z: number) => boolean;
  /** Extra pictures of spruce and beech in the far layer, between the scattered trees. */
  distant?: number;
  /** Spots where a spruce's low branches would hang over the path. Beech and birch may stand there. */
  spruceClear?: (x: number, z: number) => boolean;
}

/** A camera-facing picture on the ground, such as a tree in the far layer or a fern. */
export interface Billboard {
  texture: string;
  w: number;
  h: number;
  color: number;
  /** Meters the bottom edge is sunk into the ground at scale 1. Default 0.12, for trees on slopes. */
  sink?: number;
  /** Cut the quad to a ragged mound, for pictures that fill their width, such as `undergrowth`. */
  ragged?: boolean;
}

const treePictures = {
  spruce: { texture: 'tree_spruce', w: 4.6, h: 9.6, color: 0x6c7468 },
  bare: { texture: 'tree_beech_bare', w: 4.8, h: 9.8, color: 0x6e6860 },
  birch: { texture: 'tree_birch', w: 3.6, h: 7.4, color: 0x8a8070 },
  snag: { texture: 'tree_dead_snag', w: 3.4, h: 7, color: 0x7a7064 },
} satisfies Record<string, Billboard>;

export type WoodKind = 'spruce' | 'bare' | 'birch';

/** A few models of each kind, so neighbouring trees differ in more than size and turn. */
const leafyModels = {
  spruce: () => [leafySpruce('a'), leafySpruce('b', { ivy: true }), leafySpruce('c')],
  bare: () => [leafyBeech('a', { ivy: true }), leafyBeech('b')],
  birch: () => ['birch' as const],
};

/** Solid trees dressed in needle and leaf cards, the variants dealt out in turn. */
export function leafyTrees(kit: LevelKit, kind: WoodKind, spots: readonly TreeSpot[]): void {
  const models = leafyModels[kind]();
  models.forEach((model, v) => {
    const mine = spots.filter((_, i) => i % models.length === v);
    if (mine.length) kit.trees(model, mine).collider().shade(0.14);
  });
}

/**
 * Beeches on the trails' edges, `from` to `to` meters out, leaning in over the trail so their
 * leaves close overhead in places, as old trees do over a forest track.
 */
export function leaningBeeches(kit: LevelKit, options: { area: Area; seed: string; trails: Trail[]; count: number; from?: number; to?: number; avoid?: (x: number, z: number) => boolean }): void {
  const { trails, from = 2.4, to = 4.2 } = options;
  const spots = scatter({
    ...options.area,
    count: options.count,
    seed: `${options.seed}-leaning`,
    spacing: 4.5,
    scale: [0.9, 1.2],
    avoid: (x, z) => {
      const d = distanceToTrails(trails, x, z);
      return d < from || d > to || (options.avoid?.(x, z) ?? false);
    },
  }).map((spot) => {
    // Turned so the model's +X, the way it leans, points at the trail.
    const p = nearestOnTrails(trails, spot.x, spot.z);
    return { ...spot, yaw: (Math.atan2(-(p.z - spot.z), p.x - spot.x) * 180) / Math.PI };
  });
  [leafyBeech('lean-a', { lean: 0.42 }), leafyBeech('lean-b', { lean: 0.32, ivy: true })].forEach((model, v) => {
    const mine = spots.filter((_, i) => i % 2 === v);
    if (mine.length) kit.trees(model, mine).collider().shade(0.12);
  });
}

/**
 * Dense spruce with beech and a few birch between. Near trees are instanced models hung with
 * needle and leaf cards; far ones are pictures, the way PS1 games filled a forest past the path.
 */
export function woodland(kit: LevelKit, options: WoodlandOptions): TreeSpot[] {
  const { area, seed, avoid } = options;
  const near = options.near ?? (() => true);
  const spruceAvoid = (x: number, z: number) => avoid(x, z) || (options.spruceClear?.(x, z) ?? false);
  const spruce = scatter({ ...area, count: options.spruce, seed: `${seed}-spruce`, spacing: 1.8, avoid: spruceAvoid, scale: [0.85, 1.35] });
  const taken = (x: number, z: number) => avoid(x, z) || spruce.some((s) => Math.hypot(s.x - x, s.z - z) < 1.5);
  const beech = scatter({ ...area, count: options.beech ?? 0, seed: `${seed}-beech`, spacing: 2.6, avoid: taken, scale: [0.85, 1.25] });
  const birch = scatter({ ...area, count: options.birch ?? 0, seed: `${seed}-birch`, spacing: 3, avoid: taken, scale: [0.8, 1.1] });
  const kinds = [
    ['spruce', spruce],
    ['bare', beech],
    ['birch', birch],
  ] as const;
  kinds.forEach(([kind, spots]) => {
    leafyTrees(kit, kind, spots.filter((s) => near(s.x, s.z)));
    billboards(kit, treePictures[kind], spots.filter((s) => !near(s.x, s.z)));
  });
  if (options.distant) {
    const all = [...spruce, ...beech, ...birch];
    const free = (x: number, z: number) => avoid(x, z) || near(x, z) || all.some((s) => Math.hypot(s.x - x, s.z - z) < 1.3);
    const fill = scatter({ ...area, count: options.distant, seed: `${seed}-distant`, spacing: 1.15, avoid: free, scale: [0.75, 1.3] });
    billboards(kit, treePictures.spruce, fill.filter((_, i) => i % 4 === 1 || i % 4 === 2));
    billboards(kit, treePictures.bare, fill.filter((_, i) => i % 4 === 0));
    billboards(kit, treePictures.snag, fill.filter((_, i) => i % 8 === 3));
  }
  return [...spruce, ...beech, ...birch];
}

/**
 * Many pictures of one kind as a single instanced mesh standing on the ground. Each spot gets a
 * slightly different shade, so a stand of them doesn't read as stamped copies.
 */
export function billboards(kit: LevelKit, picture: Billboard, spots: readonly TreeSpot[]): void {
  const geometry = picture.ragged ? raggedPanel(picture.w, picture.h, picture.texture) : spriteGeometry(picture.w, picture.h);
  pictures(kit, geometry, picture, spots);
}

/** Like `billboards`, with any flat shape in the XY plane standing on its origin. */
function pictures(kit: LevelKit, geometry: BufferGeometry, picture: Billboard & { uvScale?: [number, number] }, spots: readonly TreeSpot[]): void {
  if (!spots.length) return;
  kit.use((ctx) => {
    const material = createPs1Material({
      map: ctx.world.textures.get(picture.texture),
      billboard: true,
      alphaTest: 0.5,
      side: DoubleSide,
      ...(picture.uvScale ? { uvScale: picture.uvScale } : {}),
    });
    const mesh = new InstancedMesh(geometry, material, spots.length);
    const random = seededRandom(hashString(`${picture.texture}-${spots.length}`));
    const base = new Color(picture.color);
    ctx.world.scene.add(mesh);
    ctx.later('place', () => {
      const matrix = new Matrix4();
      spots.forEach((spot, i) => {
        const scale = spot.scale ?? 1;
        // Sunk a little so the picture's bottom edge never floats on a slope.
        const y = ctx.world.ground.sample(spot.x, spot.z).height - (picture.sink ?? 0.12) * scale;
        mesh.setMatrixAt(i, matrix.compose(new Vector3(spot.x, y, spot.z), new Quaternion(), new Vector3(scale, scale, scale)));
        mesh.setColorAt(i, base.clone().multiplyScalar(0.82 + random() * 0.3));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  });
}

/**
 * A picture cut to a ragged mound: tall in the middle with a jagged top, falling away to both
 * ends, so a plant or a stretch of spruce wall never shows the straight edge of its quad. UVs
 * run 0 to 1 over the picture, or in meters with `tiled` for a tiling texture. `notch` is how
 * far down the top dips between points, `column` how far apart the points are, in meters.
 */
function raggedPanel(w: number, h: number, seed: string, options: { tiled?: boolean; notch?: number; column?: number } = {}): BufferGeometry {
  const { tiled = false, notch = 0.75, column = 0.35 } = options;
  const random = seededRandom(hashString(seed));
  const columns = Math.max(4, Math.round(w / column));
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= columns; i++) {
    const across = (2 * i) / columns - 1;
    const x = (across * w) / 2;
    const top = h * (1 - 0.7 * Math.abs(across) ** 2.2) * (i % 2 ? 0.92 + random() * 0.16 : notch + random() * 0.15);
    positions.push(x, 0, 0, x, top, 0);
    if (tiled) uvs.push(x, 0, x, top);
    else uvs.push(i / columns, 0, i / columns, top / h);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

/** The far layer: panels of spruce wall in the band `from` to `to` meters off the trails. */
export function spruceWall(kit: LevelKit, options: { area: Area; seed: string; trails: Trail[]; from: number; to: number; count: number; avoid?: (x: number, z: number) => boolean }): void {
  const { trails, from, to } = options;
  const outside = (x: number, z: number) => {
    const d = distanceToTrails(trails, x, z);
    return d < from || d > to || (options.avoid?.(x, z) ?? false);
  };
  const spots = scatter({ ...options.area, count: options.count, seed: `${options.seed}-wall`, spacing: 2.6, avoid: outside, scale: [0.85, 1.2] });
  pictures(kit, raggedPanel(7, 11, options.seed, { tiled: true, notch: 0.42, column: 0.55 }), { texture: 'spruce_wall', w: 7, h: 11, color: 0x6a7266, sink: 0.3, uvScale: [1 / 3, 1 / 3] }, spots);
}

const plants = [
  { texture: 'fern_dead', w: 1.1, h: 0.85, color: 0x8a8370 },
  { texture: 'grass_tuft', w: 0.9, h: 0.6, color: 0x7e7a68 },
  { texture: 'bush', w: 1.5, h: 1.1, color: 0x6a6c5c },
  { texture: 'fern_dead', w: 0.8, h: 0.6, color: 0x77705e },
] satisfies Billboard[];

/** Knee to chest high: bramble, thick undergrowth, young spruce, all pressing in on the trails. */
export const tallPlants = [
  { texture: 'bramble', w: 1.8, h: 1.3, color: 0x7a6a62, sink: 0.15 },
  { texture: 'undergrowth', w: 2.4, h: 1.8, color: 0x6c745c, sink: 0.3, ragged: true },
  { texture: 'sapling_spruce', w: 1.1, h: 2.2, color: 0x6e7a68, sink: 0.08 },
  { texture: 'bramble', w: 1.3, h: 0.95, color: 0x6a5c54, sink: 0.12 },
  { texture: 'undergrowth', w: 1.8, h: 1.35, color: 0x62684f, sink: 0.25, ragged: true },
  { texture: 'bush', w: 1.6, h: 1.2, color: 0x5e6252 },
] satisfies Billboard[];

/** Ankle high, close to the trail's edge: ferns, tufts, and ivy over the roots. */
export const lowPlants = [
  { texture: 'fern_dead', w: 1.1, h: 0.85, color: 0x8a8370 },
  { texture: 'ivy_clump', w: 0.9, h: 0.6, color: 0x5c6650, sink: 0.18 },
  { texture: 'grass_tuft', w: 0.9, h: 0.6, color: 0x7e7a68 },
  { texture: 'fern_dead', w: 0.8, h: 0.6, color: 0x77705e },
  { texture: 'ivy_clump', w: 0.7, h: 0.5, color: 0x56604a, sink: 0.15 },
] satisfies Billboard[];

/** Plants kept off the trails, dealt out in turn from `mix`, by default ferns, tufts, and low bushes. */
export function undergrowth(
  kit: LevelKit,
  area: Area,
  options: { seed: string; count: number; avoid: (x: number, z: number) => boolean; mix?: readonly Billboard[]; spacing?: number },
): void {
  const mix = options.mix ?? plants;
  const spots = scatter({ ...area, count: options.count, seed: `${options.seed}-plants`, spacing: options.spacing ?? 1.1, scale: [0.7, 1.25], avoid: options.avoid });
  mix.forEach((plant, kind) => billboards(kit, plant, spots.filter((_, i) => i % mix.length === kind)));
}

/**
 * Ragged patches of moss over the forest floor, each draped on the ground by sampling `height`
 * at every vertex, all merged into one mesh.
 */
export function mossPatches(kit: LevelKit, height: Height, spots: readonly TreeSpot[]): void {
  if (!spots.length) return;
  const rim = 9;
  const patches = spots.map((spot, n) => {
    const random = seededRandom(hashString(`moss-${n}`));
    const r = 0.9 * (spot.scale ?? 1) + random() * 0.8;
    const ring = Array.from({ length: rim }, (_, i) => {
      const a = (i / rim) * Math.PI * 2;
      const k = r * (0.6 + random() * 0.5);
      return [spot.x + Math.cos(a) * k, spot.z + Math.sin(a) * k] as const;
    });
    const center = [spot.x, spot.z] as const;
    const positions = ring.flatMap((p, i) => {
      const q = ring[(i + 1) % rim]!;
      return [center, q, p].flatMap(([x, z]) => [x, height(x, z) + 0.06, z]);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new Float32BufferAttribute(positions.flatMap((v, i) => (i % 3 === 1 ? [] : [v])), 2));
    geometry.computeVertexNormals();
    return geometry;
  });
  kit.mesh(mergeGeometries(patches)!).texture('moss_floor', { tile: 2.5 }).color(0x8a9070);
}

/** A fallen trunk lying on the ground along its yaw, solid to walk into. */
export function fallenLog(kit: LevelKit, x: number, z: number, yaw: number, length = 4.5, radius = 0.22): void {
  const geometry = cylinderGeometry(radius, length, 7, 1)
    .rotateZ(Math.PI / 2)
    .translate(length / 2, radius, 0);
  kit.mesh(geometry).texture('bark_spruce', { tile: [1, 1.2] }).color(0x6f665c).at(x, -radius * 0.35, z).rotY(yaw).onGround().collider();
  // A broken stub of branch keeps it from reading as a pipe.
  kit
    .cylinder({ r: 0.05, h: 0.7, sides: 4 })
    .texture('bark_spruce', { tile: 0.6 })
    .color(0x5f574e)
    .at(x + Math.cos((yaw * Math.PI) / 180) * length * 0.2, radius * 1.2, z - Math.sin((yaw * Math.PI) / 180) * length * 0.2)
    .rotY(yaw + 40)
    .onGround();
}

/** A lumpy mossy boulder, sunk `sink` meters into the ground. Big ones block the player. */
export function rock(kit: LevelKit, x: number, z: number, size: number, seed: string, sink = 0.08): MeshBuilder {
  const random = seededRandom(hashString(seed));
  const geometry = new IcosahedronGeometry(1, 0).toNonIndexed();
  const position = geometry.getAttribute('position');
  const v = new Vector3();
  const offsets = new Map<string, number>();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    if (!offsets.has(key)) offsets.set(key, 0.75 + random() * 0.5);
    const k = offsets.get(key)!;
    position.setXYZ(i, v.x * k * size, Math.max(v.y * k * size * 0.62, -0.1), v.z * k * size * 0.85);
  }
  geometry.computeVertexNormals();
  const boulder = kit.mesh(geometry).texture('moss_rock', { tile: 0.8 }).color(0x8a8a7e).at(x, -sink, z).rotY(random() * 360).onGround();
  if (size > 0.45) boulder.collider();
  return boulder;
}

/** Invisible walls around an area, hidden in the fog. */
export function enclose(kit: LevelKit, area: Area): void {
  const { x, z, w, d } = area;
  kit.barrier({ w, d: 1 }).at(x, 0, z - d / 2);
  kit.barrier({ w, d: 1 }).at(x, 0, z + d / 2);
  kit.barrier({ w: 1, d }).at(x - w / 2, 0, z);
  kit.barrier({ w: 1, d }).at(x + w / 2, 0, z);
}

/**
 * The forest's air: wind in the tops at the strength the weather gives, trunks creaking, mist
 * along the ground, the church bell from the village below on the hour. By day leaves come down,
 * a crow calls, and a cowbell carries up from the fields. At night no birds, only small sounds
 * close by, the reporter's breath, and on wet nights drizzle and drops off the branches.
 */
export function forestAmbience(kit: LevelKit, ctx: SceneContext): void {
  wildlife(kit, ctx, 'forest');
  const night = ctx.state.time === 'night';
  const sky = weather(ctx.state);
  windInTrees(kit, ctx, sky.wind);
  windSway(kit, 0.5 + sky.wind);
  particles(kit, fogWisps(night ? { opacity: 0.3 } : {}));
  // The village is downhill to the south of every Bois-Noir scene.
  hourBells(kit, ctx, { x: 0, z: 1 }, night ? 0.45 : 0.35);
  kit.ambience('crackle', night ? { interval: 6, volume: 0.45, distance: [4, 16] } : { interval: 11, volume: 0.3 });
  const { audio } = ctx;
  if (night) {
    if (sky.breath) breathVapor(kit, ctx);
    if (sky.drizzle) {
      particles(kit, drizzle());
      loop(kit, () => rain(audio, { surface: 'leaves', volume: 0.3 }));
      nowAndThen(kit, ctx, 3, () => waterDrop(audio, around(ctx, 1.5 + Math.random() * 5, 0), 0.25), 2);
    }
    distantDog(kit, ctx, 150);
    return;
  }
  particles(kit, fallingLeaves());
  nowAndThen(kit, ctx, 45, () => caw(ctx, around(ctx, 22 + Math.random() * 18, 12)), 15);
  nowAndThen(kit, ctx, 70, () => {
    // Downhill, south, where the fields are: a cow grazing moves her head two or three times.
    const p = ctx.player.position;
    const at = { x: p.x + (Math.random() - 0.5) * 60, y: p.y - 20, z: p.z + 60 };
    [0, 0.5, 1.3].slice(0, 2 + Math.floor(Math.random() * 2)).forEach((delay) => setTimeout(() => cowbell(audio, { at, volume: 0.22 }), delay * 1000));
  }, 30);
  // The road along the valley floor, far below and out of sight.
  const p = ctx.player.position;
  distantTraffic(kit, ctx, [{ x: p.x - 150, y: p.y - 30, z: p.z + 110 }, { x: p.x + 150, y: p.y - 30, z: p.z + 110 }], 140);
}
