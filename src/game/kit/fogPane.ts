import { DataTexture, NearestFilter, RGBAFormat } from 'three';

/**
 * The view through a window: fog pressed against the glass, lighter toward the top, with a
 * neighbour's roof and a few spruce tops just showing in the lower third. Darker than the fog
 * outside, so a pane never outshines the room. Painted at PS1 size and drawn unlit.
 */

export const PANE_SIZE = 32;

export interface PaneLook {
  night: boolean;
  /** A street lamp out in the fog, as an orange smear on the glass at night. */
  lamp?: boolean;
}

type Rgb = readonly [number, number, number];

const SKY: Record<'day' | 'night', { top: Rgb; bottom: Rgb; shape: Rgb }> = {
  day: { top: [0x86, 0x8b, 0x8c], bottom: [0x66, 0x6b, 0x6c], shape: [0x4c, 0x51, 0x52] },
  night: { top: [0x0b, 0x0d, 0x11], bottom: [0x07, 0x08, 0x0b], shape: [0x03, 0x04, 0x05] },
};
const LAMP: Rgb = [0x4a, 0x30, 0x18];
/** How much of the silhouette shows through the fog, 0 to 1. */
const SHAPE_STRENGTH = 0.45;

/** Height in pixels, from the bottom, of the roof and tree line at column `x`. */
export function skyline(x: number): number {
  const roof = x < 14 ? Math.max(0, 9 - Math.abs(x - 7)) + 3 : 0;
  const tree = (cx: number, h: number) => Math.max(0, h - Math.abs(x - cx) * 2.2);
  return Math.max(roof, tree(19, 8), tree(24, 10), tree(29, 7), 2);
}

/** RGBA pixels of the pane, `PANE_SIZE` square, row 0 at the bottom. */
export function fogPanePixels(look: PaneLook): Uint8Array {
  const sky = SKY[look.night ? 'night' : 'day'];
  const pixels = new Uint8Array(PANE_SIZE * PANE_SIZE * 4);
  for (let y = 0; y < PANE_SIZE; y++) {
    for (let x = 0; x < PANE_SIZE; x++) {
      const t = y / (PANE_SIZE - 1);
      let rgb = mix(sky.bottom, sky.top, t);
      if (y < skyline(x)) rgb = mix(rgb, sky.shape, SHAPE_STRENGTH);
      if (look.night && look.lamp) {
        const d = Math.hypot(x - 22, y - 20) / 9;
        if (d < 1) rgb = mix(rgb, LAMP, (1 - d) * (1 - d));
      }
      pixels.set([...rgb, 255], (y * PANE_SIZE + x) * 4);
    }
  }
  return pixels;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [0, 1, 2].map((i) => Math.round(a[i]! + (b[i]! - a[i]!) * t)) as unknown as Rgb;
}

const cache = new Map<string, DataTexture>();

/** The pane as a texture with PS1 sampling, one per look, shared by every window. */
export function fogPaneTexture(look: PaneLook): DataTexture {
  const key = `${look.night}-${look.night && !!look.lamp}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const texture = new DataTexture(fogPanePixels(look), PANE_SIZE, PANE_SIZE, RGBAFormat);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}
