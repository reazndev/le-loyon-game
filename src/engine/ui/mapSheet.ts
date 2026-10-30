import type { Vec2 } from '../physics/collision';

/** What covers the ground on the map, from least to most important. Where covers overlap, the later one is drawn. */
export const COVERS = ['open', 'field', 'dirt', 'floor', 'path', 'water', 'deck', 'solid', 'wall', 'roof', 'mark'] as const;
export type Cover = (typeof COVERS)[number];

export interface MapExit extends Vec2 {
  /** The place it leads to, in a word or two. */
  label: string;
}

/** The level seen from above, worked out once when it loads, for the map to read from. */
export interface MapSketch {
  cover(x: number, z: number): Cover;
  /** Whether trees stand thick around a point. */
  wooded(x: number, z: number): boolean;
  /** One tree for every `spacing` meters of woodland, so the symbols don't pile up. */
  trees(spacing: number): readonly Vec2[];
  exits: readonly MapExit[];
  /** The middle of the level, so an exit's arrow can point away from it. */
  center: Vec2;
}

export interface MapView {
  player: Vec2;
  /** Radians; 0 looks down -Z, positive turns left. */
  yaw: number;
  target: Vec2 | null;
  sketch: MapSketch;
}

/** Map pixels across, and meters from the player to the edge. */
export interface Sheet {
  size: number;
  range: number;
  /** A round scrap in the corner, or a sheet with torn edges in hand. */
  round: boolean;
}

/** Old paper greyed by the fog, inked by hand, with muted washes for woods, fields, and water. */
const PAPER = '#8a8166';
const STAIN = '#6c6450';
const INK = '#2b241a';
const RED_INK = '#7e2016';
const TREE_INK = '#323726';
const WATER_INK = '#2f3b3b';
const LABEL_PAPER = '#a39878';

const FILL: Record<Cover, string> = {
  open: PAPER,
  field: '#988a5c',
  dirt: '#766a4f',
  floor: '#a1987c',
  path: '#ada282',
  water: '#6a7672',
  deck: '#9b8a62',
  solid: INK,
  wall: INK,
  roof: '#958a6a',
  mark: INK,
};
const WOODED = '#7b7b5f';
const FIELD_DOTS = '#776a45';
const RIPPLE = '#4a5654';
/** Covers whose border is drawn as a line, so a track reads as two lines and a roof as a block. */
const OUTLINED = new Set<Cover>(['path', 'water', 'deck', 'roof']);
/** Ground a tree symbol can stand on. */
const PLANTABLE = new Set<Cover>(['open', 'field', 'dirt']);

/** A spruce for the sheet in hand, and a smaller one for the corner. */
const TREE_LARGE = ['..#..', '.###.', '#####', '..#..'];
const TREE_SMALL = ['.#.', '###'];

/** Hand lettering, three pixels by five, row by row. */
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '-': '000000111000000', ' ': '000000000000000',
};

/** The same grain every frame, from the pixel's place on the sheet. */
const grain = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const rank = new Map(COVERS.map((cover, i) => [cover, i]));

/** Draws the level around the player in ink on old paper, heading up, with the ways out and the target. */
export function drawMap(g: CanvasRenderingContext2D, view: MapView, { size, range, round }: Sheet): void {
  g.clearRect(0, 0, size, size);
  const mid = size / 2;
  const scale = mid / range;
  // Marks are drawn in blocks of `unit` pixels, so they stay as easy to spot on the large sheet.
  const unit = Math.max(1, Math.round(size / 90));
  const forward = { x: -Math.sin(view.yaw), z: -Math.cos(view.yaw) };
  const right = { x: Math.cos(view.yaw), z: -Math.sin(view.yaw) };
  const toMap = (x: number, z: number): [number, number] => {
    const dx = x - view.player.x;
    const dz = z - view.player.z;
    return [mid + (dx * right.x + dz * right.z) * scale, mid - (dx * forward.x + dz * forward.z) * scale];
  };
  const toWorld = (px: number, py: number): Vec2 => {
    const across = (px + 0.5 - mid) / scale;
    const ahead = (mid - py - 0.5) / scale;
    return { x: view.player.x + across * right.x + ahead * forward.x, z: view.player.z + across * right.z + ahead * forward.z };
  };
  const fromEdge = (x: number, y: number) =>
    round ? mid - 0.5 - Math.hypot(x + 0.5 - mid, y + 0.5 - mid) : Math.min(x, y, size - 1 - x, size - 1 - y) - (grain(x, y) % 3);
  const block = (x: number, y: number, w = 1) => g.fillRect(Math.round(x), Math.round(y), w * unit, unit);

  paintGround(g, view.sketch, size, unit, toWorld, fromEdge);
  drawTrees(g, view, size, scale, unit, toMap, fromEdge, round);
  drawExits(g, view, size, unit, toMap, forward, right, round);

  // The target: a red X, held to the edge of the sheet when it is further away.
  if (view.target) {
    const [x, y] = clampToSheet(toMap(view.target.x, view.target.z), mid, mid - 5 * unit);
    g.fillStyle = RED_INK;
    [-2, -1, 0, 1, 2].forEach((d) => {
      block(x + d * unit, y + d * unit);
      block(x + d * unit, y - d * unit);
    });
  }

  // The reporter: a small ink arrowhead, always pointing up.
  g.fillStyle = RED_INK;
  [[0, -3, 1], [-1, -2, 3], [-1, -1, 3], [-2, 0, 5], [-2, 1, 2], [1, 1, 2]].forEach(([dx, dy, w]) =>
    block(Math.round(mid) + dx! * unit, Math.round(mid) + dy! * unit, w!),
  );
}

/** Fills the paper pixel by pixel: the cover under each, with its border inked where it meets lesser ground. */
function paintGround(
  g: CanvasRenderingContext2D,
  sketch: MapSketch,
  size: number,
  unit: number,
  toWorld: (x: number, y: number) => Vec2,
  fromEdge: (x: number, y: number) => number,
): void {
  const covers: Cover[] = [];
  const wooded: boolean[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const at = toWorld(x, y);
      covers.push(sketch.cover(at.x, at.z));
      wooded.push(sketch.wooded(at.x, at.z));
    }
  }
  const at = (x: number, y: number) => covers[Math.min(size - 1, Math.max(0, y)) * size + Math.min(size - 1, Math.max(0, x))]!;
  const lower = (cover: Cover, x: number, y: number) =>
    [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some((other) => rank.get(other)! < rank.get(cover)!);
  // Gravestones and rocks are smaller than a pixel on the large sheet; widen them to a block.
  const marked = (x: number, y: number) =>
    at(x, y) === 'mark' || (unit > 1 && [at(x - 1, y), at(x, y - 1), at(x - 1, y - 1)].includes('mark'));

  const colorAt = (x: number, y: number): string | null => {
    const edge = fromEdge(x, y);
    if (edge < 0) return null;
    // Stains creep in from the edge, and a few specks of dirt sit on the sheet.
    if (edge < 2 + (grain(x, y) % 3) || grain(x, y) % 97 === 0) return STAIN;
    if (marked(x, y)) return INK;
    const cover = at(x, y);
    if (OUTLINED.has(cover) && lower(cover, x, y)) return cover === 'water' ? WATER_INK : INK;
    if (cover === 'roof' && (x + y) % 3 === 0) return INK;
    if (cover === 'water' && y % 3 === 0 && (x + y) % 5 === 0) return RIPPLE;
    if (cover === 'field' && x % 4 === (y % 8 < 4 ? 0 : 2) && y % 4 === 0) return FIELD_DOTS;
    if (cover === 'open' && wooded[y * size + x]) return WOODED;
    return FILL[cover];
  };

  const image = g.createImageData(size, size);
  const colors = new Map<string, [number, number, number]>();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = colorAt(x, y);
      if (!color) continue;
      if (!colors.has(color)) colors.set(color, rgb(color));
      const [r, gr, b] = colors.get(color)!;
      image.data.set([r, gr, b, 255], (y * size + x) * 4);
    }
  }
  g.putImageData(image, 0, 0);
}

/** Small ink spruces over the woods, one per patch of trees, anchored to the ground so they don't swim as the player turns. */
function drawTrees(
  g: CanvasRenderingContext2D,
  view: MapView,
  size: number,
  scale: number,
  unit: number,
  toMap: (x: number, z: number) => [number, number],
  fromEdge: (x: number, y: number) => number,
  round: boolean,
): void {
  const glyph = round ? TREE_SMALL : TREE_LARGE;
  // A whole number of meters, so the same trees are picked every frame.
  const spacing = Math.max(2, Math.round((glyph[0]!.length + 3) / scale));
  const reach = (size / 2) * 1.5;
  g.fillStyle = TREE_INK;
  view.sketch.trees(spacing).forEach((tree) => {
    const [mx, my] = toMap(tree.x, tree.z);
    if (Math.abs(mx - size / 2) > reach || Math.abs(my - size / 2) > reach) return;
    const x = Math.round(mx);
    const y = Math.round(my);
    if (fromEdge(x, y) < 3 + unit || !PLANTABLE.has(view.sketch.cover(tree.x, tree.z))) return;
    const half = (glyph[0]!.length - 1) / 2;
    glyph.forEach((row, dy) => [...row].forEach((bit, dx) => bit === '#' && g.fillRect(x - half + dx, y - glyph.length + 1 + dy, 1, 1)));
  });
}

/** Each way out: an ink arrow pointing out of the level, and on the sheet in hand the place it leads to. */
function drawExits(
  g: CanvasRenderingContext2D,
  view: MapView,
  size: number,
  unit: number,
  toMap: (x: number, z: number) => [number, number],
  forward: Vec2,
  right: Vec2,
  round: boolean,
): void {
  const mid = size / 2;
  const { center } = view.sketch;
  const labels: { left: number; top: number; w: number }[] = [];
  view.sketch.exits.forEach((exit) => {
    const [x, y] = clampToSheet(toMap(exit.x, exit.z), mid, mid - (round ? 5 : 9) * unit);
    const out = { x: exit.x - center.x, z: exit.z - center.z };
    const length = Math.hypot(out.x, out.z) || 1;
    const dx = (out.x * right.x + out.z * right.z) / length;
    const dy = -(out.x * forward.x + out.z * forward.z) / length;
    g.fillStyle = INK;
    const tip = { x: x + dx * 3 * unit, y: y + dy * 3 * unit };
    inkLine(g, x - dx * 3 * unit, y - dy * 3 * unit, tip.x, tip.y, unit);
    [0.75, -0.75].forEach((turn) => {
      const c = Math.cos(Math.PI + turn);
      const s = Math.sin(Math.PI + turn);
      inkLine(g, tip.x, tip.y, tip.x + (dx * c - dy * s) * 2.5 * unit, tip.y + (dx * s + dy * c) * 2.5 * unit, unit);
    });
    if (round) return;
    const text = exit.label.toUpperCase();
    const w = text.length * 4 - 1;
    const left = Math.round(Math.min(size - 6 - w, Math.max(6, x - dx * 7 * unit - w / 2)));
    let top = Math.round(Math.min(size - 11, Math.max(6, y - dy * 7 * unit - 2)));
    // Doors close together would print their names over each other; step down a line until clear.
    const clashes = () => labels.some((l) => left < l.left + l.w + 2 && l.left < left + w + 2 && Math.abs(top - l.top) < 8);
    while (clashes() && top + 8 <= size - 11) top += 8;
    labels.push({ left, top, w });
    g.fillStyle = LABEL_PAPER;
    g.fillRect(left - 1, top - 1, w + 2, 7);
    g.fillStyle = INK;
    [...text].forEach((char, i) =>
      [...(GLYPHS[char] ?? GLYPHS[' ']!)].forEach((bit, j) => bit === '1' && g.fillRect(left + i * 4 + (j % 3), top + Math.floor(j / 3), 1, 1)),
    );
  });
}

/** Pulls a point toward the middle of the sheet until it is within `radius`. */
function clampToSheet([x, y]: [number, number], mid: number, radius: number): [number, number] {
  const k = Math.min(1, radius / Math.max(Math.hypot(x - mid, y - mid), 1));
  return [Math.round(mid + (x - mid) * k), Math.round(mid + (y - mid) * k)];
}

function inkLine(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, unit: number): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    g.fillRect(Math.round(x0 + (x1 - x0) * t - unit / 2), Math.round(y0 + (y1 - y0) * t - unit / 2), unit, unit);
  }
}
