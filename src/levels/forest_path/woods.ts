import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { cowbell } from '../../engine/characters/voices';
import { cylinderGeometry, spriteGeometry } from '../../engine/render/geometry';
import { hashString, seededRandom } from '../../engine/random';
import type { Atmosphere } from '../../engine/render/atmosphere';
import { createPs1Material } from '../../engine/render/ps1Material';
import type { TreeSpot } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import type { SceneContext } from '../../game/scene';
import type { TimeOfDay } from '../../game/state';
import { caw } from '../cemetery/sounds';
import { nowAndThen } from '../village_square/atmosphere';
import { resample, type Trail } from './trail';

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
    fog: { color: 0x8b8e8a, near: 1, far: 15, density: 0.09, wisps: 0.5 },
    ambient: 0x5c5e58,
    sun: { color: 0x464742, direction: [0.3, 1, 0.45] },
    saturation: 0.58,
  },
  night: {
    fog: { color: 0x030405, near: 0.4, far: 11, density: 0.16, wisps: 0.3 },
    ambient: 0x07080a,
    sun: { color: 0x05060a, direction: [-0.4, 1, 0.3] },
    saturation: 0.5,
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
  kit.mesh(geometry).texture('mud', { tile: 2.2 }).color(0x6e675e).doubleSided();
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
}

const treePictures = {
  spruce: { texture: 'tree_spruce', w: 4.6, h: 9.6, color: 0x6c7468 },
  bare: { texture: 'tree_beech_bare', w: 4.8, h: 9.8, color: 0x6e6860 },
  birch: { texture: 'tree_birch', w: 3.6, h: 7.4, color: 0x8a8070 },
} satisfies Record<string, Billboard>;

/**
 * Dense spruce with beech and a few birch between. Near trees are instanced models, solid at the
 * trunks; far ones are pictures, the way PS1 games filled a forest past the path.
 */
export function woodland(kit: LevelKit, options: WoodlandOptions): TreeSpot[] {
  const { area, seed, avoid } = options;
  const near = options.near ?? (() => true);
  const spruceAvoid = (x: number, z: number) => avoid(x, z) || (options.spruceClear?.(x, z) ?? false);
  const spruce = scatter({ ...area, count: options.spruce, seed: `${seed}-spruce`, spacing: 2.1, avoid: spruceAvoid, scale: [0.85, 1.35] });
  const taken = (x: number, z: number) => avoid(x, z) || spruce.some((s) => Math.hypot(s.x - x, s.z - z) < 1.6);
  const beech = scatter({ ...area, count: options.beech ?? 0, seed: `${seed}-beech`, spacing: 3, avoid: taken, scale: [0.9, 1.3] });
  const birch = scatter({ ...area, count: options.birch ?? 0, seed: `${seed}-birch`, spacing: 3, avoid: taken, scale: [0.8, 1.1] });
  const kinds = [
    ['spruce', spruce],
    ['bare', beech],
    ['birch', birch],
  ] as const;
  kinds.forEach(([kind, spots]) => {
    const models = spots.filter((s) => near(s.x, s.z));
    if (models.length) kit.trees(kind, models).collider();
    billboards(kit, treePictures[kind], spots.filter((s) => !near(s.x, s.z)));
  });
  if (options.distant) {
    const all = [...spruce, ...beech, ...birch];
    const free = (x: number, z: number) => avoid(x, z) || near(x, z) || all.some((s) => Math.hypot(s.x - x, s.z - z) < 1.4);
    const fill = scatter({ ...area, count: options.distant, seed: `${seed}-distant`, spacing: 1.25, avoid: free, scale: [0.75, 1.3] });
    billboards(kit, treePictures.spruce, fill.filter((_, i) => i % 4 !== 0));
    billboards(kit, treePictures.bare, fill.filter((_, i) => i % 4 === 0));
  }
  return [...spruce, ...beech, ...birch];
}

/**
 * Many pictures of one kind as a single instanced mesh standing on the ground. Each spot gets a
 * slightly different shade, so a stand of them doesn't read as stamped copies.
 */
export function billboards(kit: LevelKit, picture: Billboard, spots: readonly TreeSpot[]): void {
  if (!spots.length) return;
  kit.use((ctx) => {
    const material = createPs1Material({ map: ctx.world.textures.get(picture.texture), billboard: true, alphaTest: 0.5, side: DoubleSide });
    const mesh = new InstancedMesh(spriteGeometry(picture.w, picture.h), material, spots.length);
    const random = seededRandom(hashString(`${picture.texture}-${spots.length}`));
    const base = new Color(picture.color);
    ctx.world.scene.add(mesh);
    ctx.later('place', () => {
      const matrix = new Matrix4();
      spots.forEach((spot, i) => {
        const scale = spot.scale ?? 1;
        // Sunk a little so the picture's bottom edge never floats on a slope.
        const y = ctx.world.ground.sample(spot.x, spot.z).height - 0.12 * scale;
        mesh.setMatrixAt(i, matrix.compose(new Vector3(spot.x, y, spot.z), new Quaternion(), new Vector3(scale, scale, scale)));
        mesh.setColorAt(i, base.clone().multiplyScalar(0.82 + random() * 0.3));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  });
}

const plants = [
  { texture: 'fern_dead', w: 1.1, h: 0.85, color: 0x8a8370 },
  { texture: 'grass_tuft', w: 0.9, h: 0.6, color: 0x7e7a68 },
  { texture: 'bush', w: 1.5, h: 1.1, color: 0x6a6c5c },
  { texture: 'fern_dead', w: 0.8, h: 0.6, color: 0x77705e },
] satisfies Billboard[];

/** Ferns, tufts, and low bushes, kept off the trails. */
export function undergrowth(kit: LevelKit, area: Area, options: { seed: string; count: number; avoid: (x: number, z: number) => boolean }): void {
  const spots = scatter({ ...area, count: options.count, seed: `${options.seed}-plants`, spacing: 1.1, scale: [0.7, 1.25], avoid: options.avoid });
  plants.forEach((plant, kind) => billboards(kit, plant, spots.filter((_, i) => i % plants.length === kind)));
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
export function rock(kit: LevelKit, x: number, z: number, size: number, seed: string, sink = 0.08): void {
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
 * Drip from the branches and a very low wind in the tops. By day, now and then, a crow and the
 * bell of a cow from the fields far below. At night no birds, only small sounds close by.
 */
export function forestAmbience(kit: LevelKit, ctx: SceneContext): void {
  const night = ctx.state.time === 'night';
  kit.ambience('wind', { volume: night ? 0.22 : 0.3 });
  kit.ambience('crackle', night ? { interval: 6, volume: 0.45, distance: [4, 16] } : { interval: 11, volume: 0.3 });
  if (night) return;
  const { audio, player } = ctx;
  const around = (distance: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    return { x: player.position.x + Math.cos(angle) * distance, y: player.position.y + y, z: player.position.z + Math.sin(angle) * distance };
  };
  nowAndThen(kit, ctx, 45, () => caw(audio, around(22 + Math.random() * 18, 12)), 15);
  nowAndThen(kit, ctx, 70, () => {
    // Downhill, south, where the fields are: a cow grazing moves her head two or three times.
    const at = { x: player.position.x + (Math.random() - 0.5) * 60, y: player.position.y - 20, z: player.position.z + 60 };
    [0, 0.5, 1.3].slice(0, 2 + Math.floor(Math.random() * 2)).forEach((delay) => setTimeout(() => cowbell(audio, { at, volume: 0.22 }), delay * 1000));
  }, 30);
}
