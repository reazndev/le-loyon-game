import { BufferGeometry, InstancedMesh, Matrix4, Mesh, Vector3 } from 'three';
import type { Shape, Vec2 } from '../engine/physics/collision';
import { COVERS, type Cover, type MapExit, type MapSketch } from '../engine/ui/mapSheet';
import type { World } from './world';

/** Meters per cell of the cover grid, and of the grid that counts trees. */
const CELL = 0.5;
const WOOD_CELL = 4;
/** The largest grid side in cells, so a level with far scenery doesn't build a huge grid. */
const MAX_CELLS = 1200;
/** Trunks thinner than this are trees or posts, drawn as tree symbols or not at all. */
const TRUNK = 0.5;

/** What ground textures are on the map. Textures not listed here stay off it. */
const GROUND: Record<string, Cover> = {
  pasture: 'field',
  grave_dirt: 'dirt',
  gravel_path: 'path',
  mud: 'path',
  asphalt: 'path',
  cobblestone: 'path',
  snow_slush: 'path',
  wood_floor: 'floor',
  carpet: 'floor',
  concrete_floor: 'floor',
  tiles_white: 'floor',
  church_floor: 'floor',
};
/** Textures drawn wherever they show from above, whichever way they face. */
const STANDING: Record<string, Cover> = {
  roof_shingles: 'roof',
  roof_tiles: 'roof',
  gravestone_granite: 'mark',
  gravestone_sandstone: 'mark',
  moss_rock: 'mark',
  stone_wall: 'wall',
  plaster_wall: 'wall',
  render_wall: 'wall',
  church_stone: 'wall',
  concrete_bunker: 'wall',
  tunnel_vault: 'wall',
  wallpaper_home: 'wall',
  wallpaper_inn: 'wall',
  iron_fence: 'wall',
};
/** Planks are a fence or a shed wall when they stand this tall, and a bridge or deck when walked on. */
const PLANK_WALL = 0.6;
const TREE_PARTS = new Set([
  'bark_spruce', 'bark_birch', 'branch_beech', 'branch_spruce', 'branch_spruce_full', 'spruce_foliage', 'leaf_cluster', 'bush',
  'tree_spruce', 'tree_beech_bare', 'tree_birch', 'tree_dead_snag', 'tree_larch', 'sapling_spruce',
]);

/** Shorter names for where exits lead, where the scene id doesn't read well on its own. */
const PLACES: Record<string, string> = {
  village_square: 'village',
  bunker_exterior: 'bunker',
  bunker_interior: 'bunker',
  bunker_hidden: 'bunker',
  cemetery_path: 'path',
  forest_path: 'woods',
  forest_deep: 'deep woods',
  garage_dousse: 'garage',
  house_gremaud: 'Gremaud',
  house_gremaud_kitchen: 'kitchen',
  laiterie: 'dairy',
};

type Triangle = [Vector3, Vector3, Vector3];
interface Stroke {
  cover: Cover;
  points: Vec2[];
}

/**
 * Works out the map of a loaded scene from what it is made of: ground meshes by texture, walls
 * and roofs, colliders, trees, and exits. Done once per scene, as it reads every triangle.
 */
export function sketchWorld(world: World): MapSketch {
  world.scene.updateMatrixWorld(true);
  const strokes: Stroke[] = [];
  const trees: Vec2[] = [];
  world.scene.traverse((object) => {
    if (!(object instanceof Mesh) || !object.visible) return;
    const name = textureName(object);
    const tree = name !== undefined && TREE_PARTS.has(name) && (object instanceof InstancedMesh || name.startsWith('tree_'));
    if (tree) return trees.push(...instancePositions(object));
    const cover: Cover | undefined = object.userData.mapAs ?? (name && (GROUND[name] ?? STANDING[name]));
    const standing = name !== undefined && name in STANDING;
    const planks = name === 'wood_planks';
    if (!cover && !planks) return;
    const matrices = object instanceof InstancedMesh ? instanceMatrices(object) : [object.matrixWorld];
    matrices.forEach((matrix) =>
      triangles(object.geometry, matrix).forEach((tri) => {
        const kind = planks ? plankCover(world, tri) : standing || facesUp(tri) ? cover : undefined;
        if (kind) strokes.push({ cover: kind, points: tri.map(({ x, z }) => ({ x, z })) });
      }),
    );
  });
  [...world.collision.all]
    .filter((shape) => !world.barriers.has(shape) && (shape.kind === 'box' || shape.r >= TRUNK))
    .forEach((shape) => strokes.push({ cover: 'solid', points: outline(shape) }));

  const exits: MapExit[] = world.exits.map(({ to, object }) => {
    const at = new Vector3().setFromMatrixPosition(object.matrixWorld);
    return { x: at.x, z: at.z, label: PLACES[to] ?? to.replace(/_/g, ' ') };
  });
  const box = [...strokes.flatMap((stroke) => stroke.points), ...trees, ...exits].reduce(
    (b, p) => ({ x0: Math.min(b.x0, p.x), x1: Math.max(b.x1, p.x), z0: Math.min(b.z0, p.z), z1: Math.max(b.z1, p.z) }),
    { x0: 0, x1: 0, z0: 0, z1: 0 },
  );
  const grid = new CoverGrid(box, Math.max(CELL, Math.max(box.x1 - box.x0, box.z1 - box.z0) / MAX_CELLS));
  strokes.forEach((stroke) => grid.paint(stroke));

  const woods = woodedCells(trees);
  const thinned = new Map<number, Vec2[]>();
  return {
    cover: (x, z) => grid.at(x, z),
    wooded: (x, z) => woods.has(cellKey(x, z, WOOD_CELL)),
    trees: (spacing) => {
      if (!thinned.has(spacing)) {
        const picked = new Map<number, Vec2>();
        trees.forEach((t) => picked.has(cellKey(t.x, t.z, spacing)) || picked.set(cellKey(t.x, t.z, spacing), t));
        thinned.set(spacing, [...picked.values()]);
      }
      return thinned.get(spacing)!;
    },
    exits,
    center: { x: (box.x0 + box.x1) / 2, z: (box.z0 + box.z1) / 2 },
  };
}

/** One number per grid cell, cheap enough to look up for every map pixel. */
const cellKey = (x: number, z: number, size: number) => (Math.floor(x / size) + 50000) * 100000 + Math.floor(z / size) + 50000;

/** The cells with at least three trees in and around them. */
function woodedCells(trees: Vec2[]): Set<number> {
  const counts = new Map<number, number>();
  trees.forEach((t) => counts.set(cellKey(t.x, t.z, WOOD_CELL), (counts.get(cellKey(t.x, t.z, WOOD_CELL)) ?? 0) + 1));
  const around = (key: number) => [-100001, -100000, -99999, -1, 0, 1, 99999, 100000, 100001].map((step) => key + step);
  const candidates = new Set([...counts.keys()].flatMap(around));
  return new Set([...candidates].filter((key) => around(key).reduce((sum, k) => sum + (counts.get(k) ?? 0), 0) >= 3));
}

function textureName(mesh: Mesh): string | undefined {
  const material = mesh.material as { uniforms?: { uMap?: { value?: { name?: string } | null } } };
  return material.uniforms?.uMap?.value?.name || undefined;
}

function facesUp([a, b, c]: Triangle): boolean {
  const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize();
  return Math.abs(normal.y) > 0.5;
}

/** A plank walked on is a deck or a bridge; one standing tall is part of a fence or a shed. Tables and shelves are neither. */
function plankCover(world: World, tri: Triangle): Cover | undefined {
  const ys = tri.map((p) => p.y);
  if (Math.max(...ys) - Math.min(...ys) > PLANK_WALL) return 'wall';
  if (!facesUp(tri)) return undefined;
  const x = (tri[0].x + tri[1].x + tri[2].x) / 3;
  const z = (tri[0].z + tri[1].z + tri[2].z) / 3;
  const y = ys.reduce((sum, v) => sum + v, 0) / 3;
  const ground = world.ground.sample(x, z, y);
  return ground.surface === 'wood' && Math.abs(ground.height - y) < 0.1 ? 'deck' : undefined;
}

function instanceMatrices(mesh: InstancedMesh): Matrix4[] {
  return Array.from({ length: mesh.count }, (_, i) => {
    const local = new Matrix4();
    mesh.getMatrixAt(i, local);
    return new Matrix4().multiplyMatrices(mesh.matrixWorld, local);
  });
}

function instancePositions(mesh: Mesh): Vec2[] {
  const matrices = mesh instanceof InstancedMesh ? instanceMatrices(mesh) : [mesh.matrixWorld];
  return matrices.map((matrix) => {
    const at = new Vector3().setFromMatrixPosition(matrix);
    return { x: at.x, z: at.z };
  });
}

function triangles(geometry: BufferGeometry, matrix: Matrix4): Triangle[] {
  const position = geometry.getAttribute('position');
  if (!position) return [];
  const index = geometry.index;
  const count = index ? index.count : position.count;
  const vertex = (i: number) => new Vector3().fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(matrix);
  return Array.from({ length: Math.floor(count / 3) }, (_, t) => [vertex(t * 3), vertex(t * 3 + 1), vertex(t * 3 + 2)]);
}

/** A collider's footprint as a polygon. */
function outline(shape: Shape): Vec2[] {
  if (shape.kind === 'circle') {
    return Array.from({ length: 8 }, (_, i) => ({ x: shape.x + Math.cos((i * Math.PI) / 4) * shape.r, z: shape.z + Math.sin((i * Math.PI) / 4) * shape.r }));
  }
  const c = Math.cos(shape.angle);
  const s = Math.sin(shape.angle);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => {
    const lx = u! * shape.hw;
    const lz = v! * shape.hd;
    return { x: shape.x + c * lx + s * lz, z: shape.z - s * lx + c * lz };
  });
}

/** The cover of each cell, as the index of the most important cover painted over it. */
class CoverGrid {
  private readonly cells: Uint8Array;
  private readonly w: number;
  private readonly d: number;

  constructor(
    private readonly box: { x0: number; z0: number; x1: number; z1: number },
    private readonly cell: number,
  ) {
    this.w = Math.ceil((box.x1 - box.x0) / cell) + 1;
    this.d = Math.ceil((box.z1 - box.z0) / cell) + 1;
    this.cells = new Uint8Array(this.w * this.d);
  }

  at(x: number, z: number): Cover {
    const i = Math.floor((x - this.box.x0) / this.cell);
    const j = Math.floor((z - this.box.z0) / this.cell);
    if (i < 0 || j < 0 || i >= this.w || j >= this.d) return 'open';
    return COVERS[this.cells[j * this.w + i]!]!;
  }

  /** Fills a polygon, and inks its edges too, so walls seen edge-on still show as lines. */
  paint({ cover, points }: Stroke): void {
    const value = COVERS.indexOf(cover);
    const cells = points.map((p) => ({ x: (p.x - this.box.x0) / this.cell, z: (p.z - this.box.z0) / this.cell }));
    const set = (i: number, j: number) => {
      if (i >= 0 && j >= 0 && i < this.w && j < this.d) this.cells[j * this.w + i] = Math.max(this.cells[j * this.w + i]!, value);
    };
    cells.forEach((a, k) => {
      const b = cells[(k + 1) % cells.length]!;
      const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 2) + 1;
      for (let s = 0; s <= steps; s++) set(Math.floor(a.x + ((b.x - a.x) * s) / steps), Math.floor(a.z + ((b.z - a.z) * s) / steps));
    });
    const i0 = Math.floor(Math.min(...cells.map((p) => p.x)));
    const i1 = Math.ceil(Math.max(...cells.map((p) => p.x)));
    const j0 = Math.floor(Math.min(...cells.map((p) => p.z)));
    const j1 = Math.ceil(Math.max(...cells.map((p) => p.z)));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (inside(cells, i + 0.5, j + 0.5)) set(i, j);
  }
}

/** Even-odd test for a point in a polygon. */
function inside(polygon: Vec2[], x: number, z: number): boolean {
  return polygon.reduce((hit, a, k) => {
    const b = polygon[(k + 1) % polygon.length]!;
    const crosses = a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x;
    return crosses ? !hit : hit;
  }, false);
}
