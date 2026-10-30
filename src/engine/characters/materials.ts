import { DataTexture, NearestFilter, RepeatWrapping, RGBAFormat, type ColorRepresentation, type Side, type Texture } from 'three';
import { seededRandom } from '../random';
import { createPs1Material, type Ps1Material } from '../render/ps1Material';

/** Paints a small tiling texture from a function of the texel, with nearest sampling. */
function paint(size: number, seed: number, texel: (x: number, y: number, random: () => number) => number): DataTexture {
  const random = seededRandom(seed);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = Math.round(Math.max(0, Math.min(1, texel(x, y, random))) * 255);
      data.set([v, v, v, 255], (y * size + x) * 4);
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

let cloth: Texture | null = null;
let hide: Texture | null = null;
let rope: Texture | null = null;
let mask: Texture | null = null;

/** A grey weave with a little noise. Clothing colors multiply it, so flat colors read as fabric. */
export function clothTexture(): Texture {
  cloth ??= paint(16, 7, (x, y, random) => 0.8 + ((x + y) % 2) * 0.06 + (x % 4 === 0 ? -0.05 : 0) + random() * 0.12);
  return cloth;
}

/** Black blotches on white, for the heifer. Fribourg cattle were black pied. */
export function piedTexture(): Texture {
  hide ??= (() => {
    const blots = Array.from({ length: 5 }, (_, i) => {
      const random = seededRandom(31 + i);
      return { x: random() * 32, y: random() * 32, r: 4 + random() * 6 };
    });
    // Distance on a torus, so blotches wrap around the tile edges.
    const wrap = (d: number) => Math.min(Math.abs(d), 32 - Math.abs(d));
    return paint(32, 3, (x, y, random) => {
      const inside = blots.some((b) => Math.hypot(wrap(x - b.x), wrap(y - b.y)) < b.r + random() * 1.5);
      return inside ? 0.09 + random() * 0.05 : 0.82 + random() * 0.1;
    });
  })();
  return hide;
}

/** Diagonal strands with dark grooves between them. On a tube the diagonals wind round it like a laid rope. */
export function ropeTexture(): Texture {
  rope ??= paint(16, 11, (x, y, random) => {
    const across = ((x + y) % 8) / 8;
    return 0.5 + 0.4 * Math.sin(across * Math.PI) + random() * 0.08;
  });
  return rope;
}

const smoothstep = (a: number, b: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Distance from a point to the segment from `a` to `b`. */
const toSegment = (x: number, y: number, a: [number, number], b: [number, number]) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const k = Math.min(1, Math.max(0, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - a[0] - k * dx, y - a[1] - k * dy);
};

/** Size of the gas mask's front picture in meters, and where its features sit in it, from the chin up. */
export const MASK_PICTURE = { w: 0.2, h: 0.31, lens: { x: 0.038, y: 0.185, r: 0.031 }, filter: { y: 0.07, r: 0.044 } } as const;

/**
 * The rubber face of the gas mask, painted in its own meters so every shape gets enough texels:
 * a soft roll-off at the edge, shadowed seats round the lenses with a lip above, cheek creases,
 * a moulded nose, and the eyelets where the straps hook on. The lenses and filter are geometry
 * in front of it. Values are banded to a few steps, so it reads as flat PS1 shading and not as
 * a crushed photo.
 */
export function maskTexture(): Texture {
  mask ??= (() => {
    const size = 128;
    const { w, h, lens, filter } = MASK_PICTURE;
    return paint(size, 5, (px, py, random) => {
      // Meters from the picture's center line and from the chin.
      const x = ((px + 0.5) / size - 0.5) * w;
      const y = ((py + 0.5) / size) * h;
      const side = Math.abs(x);
      const edge = Math.hypot(x / (w / 2), (y - h * 0.55) / (h * 0.55));
      let v = 0.7 - 0.28 * smoothstep(0.55, 1, edge);
      // A raised rim where the face piece is bonded to its seal.
      if (edge > 0.86 && edge < 0.92) v += 0.08;
      const fromLens = Math.hypot(side - lens.x, y - lens.y);
      if (fromLens < lens.r + 0.012) v *= 0.55 + 0.45 * smoothstep(lens.r, lens.r + 0.012, fromLens);
      if (fromLens > lens.r + 0.012 && fromLens < lens.r + 0.018 && y > lens.y) v += 0.08;
      const fromFilter = Math.hypot(x, y - filter.y);
      if (fromFilter < filter.r + 0.016) v *= 0.6 + 0.4 * smoothstep(filter.r - 0.004, filter.r + 0.016, fromFilter);
      if (side < 0.007 && y > filter.y + filter.r && y < lens.y - 0.01) v += 0.07;
      if (toSegment(side, y, [0.05, 0.15], [0.085, 0.06]) < 0.0035) v -= 0.14;
      if (toSegment(side, y, [0.062, 0.25], [0.02, 0.272]) < 0.003) v -= 0.1;
      const eyelet = [0.215, 0.09].some((ey) => Math.hypot(side - 0.086, y - ey) < 0.007);
      if (eyelet) v = 0.25;
      v += 0.03 * Math.sin(px * 0.4) * Math.sin(py * 0.27) + (random() - 0.5) * 0.03;
      return Math.round(v * 10) / 10;
    });
  })();
  return mask;
}

export interface PartStyle {
  color: ColorRepresentation;
  map?: Texture;
  /** Meters per texture copy. */
  tile?: number;
  alphaTest?: number;
  /** DoubleSide for open shells such as hair and hoods, whose insides show past the face. */
  side?: Side;
}

/** A PS1 material for one body part. Untextured parts get the cloth weave. */
export function partMaterial(style: PartStyle): Ps1Material {
  const tile = style.tile ?? 0.25;
  return createPs1Material({
    map: style.map ?? clothTexture(),
    color: style.color,
    uvScale: [1 / tile, 1 / tile],
    ...(style.alphaTest ? { alphaTest: style.alphaTest } : {}),
    ...(style.side !== undefined ? { side: style.side } : {}),
  });
}
