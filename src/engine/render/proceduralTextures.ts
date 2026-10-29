/**
 * Placeholder textures painted on a canvas, so levels look like something before the real
 * texture files exist. The painter is picked from keywords in the texture name.
 */

import { hashString, seededRandom } from '../random';

type Rgb = [number, number, number];
type Painter = (paint: Paint) => void;

interface Paint {
  size: number;
  random: () => number;
  /** Tileable value noise in 0..1 at the given number of cells across the texture. */
  noise: (x: number, y: number, cells: number) => number;
  set: (x: number, y: number, rgb: Rgb, alpha?: number) => void;
}

const painters: [RegExp, number, Painter][] = [
  [/^glow/, 64, glow],
  [/cobble/, 64, cobblestone],
  [/gravestone|church|stone_wall|wall_stone|brick|ashlar/, 64, ashlar],
  [/plaster/, 64, plaster],
  [/roof/, 64, roofTiles],
  [/bark|trunk/, 32, bark],
  [/needle|leaves|foliage|spruce_crown/, 32, needles],
  [/wood|plank|door|crate/, 64, planks],
  [/gravel/, 64, gravel],
  [/grass/, 64, grass],
  [/forest_floor/, 64, forestFloor],
  [/mud|dirt|soil/, 64, dirt],
  [/snow/, 64, snow],
  [/rust|metal|iron/, 32, rust],
  [/concrete|asphalt|cement/, 64, concrete],
  [/moss|rock|stone/, 64, rock],
];

export function paintProceduralTexture(name: string): HTMLCanvasElement {
  const [, size, painter] = painters.find(([pattern]) => pattern.test(name)) ?? [null, 32, checker];
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(size, size);
  const random = seededRandom(hashString(name));
  const lattice = Array.from({ length: 64 * 64 }, random);

  painter({
    size,
    random,
    noise: (x, y, cells) => tileableNoise(lattice, (x / size) * cells, (y / size) * cells, cells),
    set: (x, y, [r, g, b], alpha = 255) => {
      const i = ((((y % size) + size) % size) * size + (((x % size) + size) % size)) * 4;
      image.data[i] = clampByte(r);
      image.data[i + 1] = clampByte(g);
      image.data[i + 2] = clampByte(b);
      image.data[i + 3] = alpha;
    },
  });
  context.putImageData(image, 0, 0);
  return canvas;
}

function forEachPixel(paint: Paint, fn: (x: number, y: number) => void): void {
  for (let y = 0; y < paint.size; y++) for (let x = 0; x < paint.size; x++) fn(x, y);
}

function shade([r, g, b]: Rgb, k: number): Rgb {
  return [r * k, g * k, b * k];
}

function cobblestone(p: Paint): void {
  // Voronoi cells: each pixel takes the color of its nearest seed, dark at cell borders.
  const seeds = Array.from({ length: 22 }, () => ({
    x: p.random() * p.size,
    y: p.random() * p.size,
    tone: 0.7 + p.random() * 0.45,
  }));
  forEachPixel(p, (x, y) => {
    const dists = seeds
      .map((s) => {
        const dx = Math.min(Math.abs(x - s.x), p.size - Math.abs(x - s.x));
        const dy = Math.min(Math.abs(y - s.y), p.size - Math.abs(y - s.y));
        return { d: Math.hypot(dx, dy), tone: s.tone };
      })
      .sort((a, b) => a.d - b.d);
    const edge = dists[1]!.d - dists[0]!.d;
    const grit = 0.85 + p.noise(x, y, 16) * 0.3;
    const base = shade([112, 108, 100], dists[0]!.tone * grit);
    p.set(x, y, edge < 1.6 ? shade([46, 44, 40], grit) : edge < 3 ? shade(base, 0.8) : base);
  });
}

function ashlar(p: Paint): void {
  // Courses of uneven height, each split into blocks of uneven width. Widths in a course sum
  // to the texture size so the pattern still tiles.
  const courses = [12, 14, 10, 16, 12].map((height) => {
    const widths: number[] = [];
    let left = p.size;
    while (left > 0) {
      const width = left < 30 ? left : 14 + Math.floor(p.random() * 16);
      widths.push(width);
      left -= width;
    }
    return { height, widths, shift: Math.floor(p.random() * p.size), tones: widths.map(() => 0.75 + p.random() * 0.4) };
  });
  let top = 0;
  for (const course of courses) {
    for (let y = top; y < top + course.height; y++) {
      for (let x = 0; x < p.size; x++) {
        const cx = (x + course.shift) % p.size;
        let edge = 0;
        let block = 0;
        while (cx >= edge + course.widths[block]!) edge += course.widths[block++]!;
        const mortar = cx - edge < 2 || y - top < 2;
        const grime = p.noise(x, y / 8, 16) < 0.3 ? 0.78 : 1;
        const grit = 0.78 + p.noise(x, y, 16) * 0.3 + p.noise(x, y, 4) * 0.2;
        const lip = y - top < 4 ? 1.08 : 1;
        p.set(x, y, mortar ? shade([50, 48, 44], grit) : shade([116, 112, 102], course.tones[block]! * grit * grime * lip));
      }
    }
    top += course.height;
  }
}

function plaster(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const stain = p.noise(x, y, 4) * 0.5 + p.noise(x, y, 8) * 0.3 + p.noise(x, y, 32) * 0.2;
    const streak = p.noise(x * 4, y / 3, 8) > 0.8 ? 0.85 : 1;
    p.set(x, y, shade([176, 168, 150], (0.75 + stain * 0.35) * streak));
  });
}

function roofTiles(p: Paint): void {
  const rows = 8;
  const rowHeight = p.size / rows;
  forEachPixel(p, (x, y) => {
    const row = Math.floor(y / rowHeight);
    const tileX = (x + (row % 2) * 4) % 8;
    const shadow = (y % rowHeight) / rowHeight;
    const grit = 0.8 + p.noise(x, y, 16) * 0.3;
    p.set(x, y, tileX === 0 ? [40, 30, 28] : shade([110, 62, 48], grit * (0.65 + shadow * 0.45)));
  });
}

function bark(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const ridge = p.noise(x, y / 6, 8) * 0.6 + p.noise(x, y / 2, 16) * 0.4;
    p.set(x, y, shade([70, 58, 46], 0.55 + ridge * 0.6));
  });
}

function needles(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const n = p.noise(x, y, 16) * 0.6 + p.noise(x, y, 8) * 0.4;
    const gap = p.noise(x, y, 8) < 0.22;
    p.set(x, y, shade([38, 52, 40], 0.55 + n * 0.7), gap ? 0 : 255);
  });
}

function planks(p: Paint): void {
  const plankWidth = p.size / 4;
  forEachPixel(p, (x, y) => {
    const plank = Math.floor(x / plankWidth);
    const seam = x % plankWidth === 0;
    const grain = p.noise(x * 4, y / 4, 8) * 0.5 + p.noise(x, y, 16) * 0.3;
    const tone = 0.8 + ((plank * 53) % 7) / 25;
    const knot = p.noise(x, y, 8) > 0.86 ? 0.7 : 1;
    p.set(x, y, seam ? [34, 26, 20] : shade([104, 80, 58], tone * (0.7 + grain * 0.5) * knot));
  });
}

function gravel(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const pebble = p.noise(x, y, 16) * 0.7 + p.noise(x, y, 32) * 0.3;
    const tone = pebble > 0.6 ? 1.2 : pebble < 0.35 ? 0.55 : 0.85;
    p.set(x, y, shade([120, 114, 104], tone * (0.8 + p.random() * 0.3)));
  });
}

function grass(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const patch = p.noise(x, y, 4);
    const blade = p.noise(x * 2, y / 2, 32);
    const dead: Rgb = [104, 96, 62];
    const green: Rgb = [62, 78, 48];
    const mix = Math.min(1, Math.max(0, patch * 1.4 - 0.2));
    const base: Rgb = [
      dead[0] * mix + green[0] * (1 - mix),
      dead[1] * mix + green[1] * (1 - mix),
      dead[2] * mix + green[2] * (1 - mix),
    ];
    const clump = p.noise(x, y, 16) < 0.3 ? 0.7 : 1;
    p.set(x, y, shade(base, (0.55 + blade * 0.6 + (p.random() - 0.5) * 0.2) * clump));
  });
}

function forestFloor(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const leaf = p.noise(x, y, 16);
    const base: Rgb = leaf > 0.6 ? [104, 62, 34] : leaf > 0.4 ? [70, 50, 34] : [44, 38, 30];
    p.set(x, y, shade(base, 0.75 + p.noise(x, y, 32) * 0.4));
  });
}

function dirt(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const n = p.noise(x, y, 8) * 0.6 + p.noise(x, y, 32) * 0.4;
    p.set(x, y, shade([82, 64, 46], 0.6 + n * 0.55));
  });
}

function snow(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const n = p.noise(x, y, 8) * 0.5 + p.noise(x, y, 32) * 0.5;
    p.set(x, y, shade([206, 210, 216], 0.85 + n * 0.17));
  });
}

function rust(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const n = p.noise(x, y, 8);
    const base: Rgb = n > 0.55 ? [112, 62, 36] : [76, 74, 72];
    p.set(x, y, shade(base, 0.7 + p.noise(x, y, 16) * 0.4));
  });
}

function concrete(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const n = p.noise(x, y, 8) * 0.4 + p.noise(x, y, 32) * 0.4 + p.random() * 0.2;
    const crack = Math.abs(p.noise(x, y, 4) - 0.5) < 0.01 ? 0.6 : 1;
    p.set(x, y, shade([120, 118, 112], (0.72 + n * 0.35) * crack));
  });
}

function rock(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const n = p.noise(x, y, 4) * 0.5 + p.noise(x, y, 16) * 0.5;
    const moss = p.noise(x, y, 8) > 0.6;
    p.set(x, y, shade(moss ? [70, 82, 52] : [104, 102, 96], 0.65 + n * 0.5));
  });
}

function glow(p: Paint): void {
  const center = (p.size - 1) / 2;
  forEachPixel(p, (x, y) => {
    const r = Math.min(1, Math.hypot(x - center, y - center) / center);
    p.set(x, y, [255, 255, 255], Math.round(255 * (1 - r) ** 2.2));
  });
}

function checker(p: Paint): void {
  forEachPixel(p, (x, y) => {
    const on = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
    p.set(x, y, on ? [120, 110, 120] : [70, 64, 70]);
  });
}

function tileableNoise(lattice: number[], x: number, y: number, cells: number): number {
  const at = (ix: number, iy: number) => lattice[(((iy % cells) + cells) % cells) * 64 + (((ix % cells) + cells) % cells)]!;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
  const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
  return top * (1 - fy) + bottom * fy;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
