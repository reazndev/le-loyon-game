import { DataTexture, NearestFilter, RepeatWrapping, RGBAFormat, type ColorRepresentation, type Texture } from 'three';
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

export interface PartStyle {
  color: ColorRepresentation;
  map?: Texture;
  /** Meters per texture copy. */
  tile?: number;
  alphaTest?: number;
}

/** A PS1 material for one body part. Untextured parts get the cloth weave. */
export function partMaterial(style: PartStyle): Ps1Material {
  const tile = style.tile ?? 0.25;
  return createPs1Material({
    map: style.map ?? clothTexture(),
    color: style.color,
    uvScale: [1 / tile, 1 / tile],
    ...(style.alphaTest ? { alphaTest: style.alphaTest } : {}),
  });
}
