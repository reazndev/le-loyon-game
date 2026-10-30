/** Size of the title picture. CSS doubles it to the 640x480 frame with nearest-neighbor filtering. */
export const TITLE_WIDTH = 320;
export const TITLE_HEIGHT = 240;

const NOISE_W = 64;
const NOISE_H = 48;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Tileable value noise, smoothed once so the fog has soft banks rather than speckle. */
function noiseField(seed: number): Float32Array {
  let state = seed;
  const random = () => ((state = (state * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const raw = Float32Array.from({ length: NOISE_W * NOISE_H }, random);
  const at = (x: number, y: number) => raw[((y + NOISE_H) % NOISE_H) * NOISE_W + ((x + NOISE_W) % NOISE_W)]!;
  return Float32Array.from({ length: raw.length }, (_, i) => {
    const x = i % NOISE_W;
    const y = Math.floor(i / NOISE_W);
    return (at(x, y) * 4 + at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1)) / 8;
  });
}

function sample(field: Float32Array, u: number, v: number): number {
  const x = ((u % NOISE_W) + NOISE_W) % NOISE_W;
  const y = ((v % NOISE_H) + NOISE_H) % NOISE_H;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const get = (dx: number, dy: number) => field[((y0 + dy) % NOISE_H) * NOISE_W + ((x0 + dx) % NOISE_W)]!;
  const top = get(0, 0) + (get(1, 0) - get(0, 0)) * fx;
  const bottom = get(0, 1) + (get(1, 1) - get(0, 1)) * fx;
  return top + (bottom - top) * fy;
}

/**
 * Paints the title background: two layers of fog drifting across black at different speeds, light
 * static, a slow rolling band, and now and then a burst of snow, all dithered to few gray levels.
 */
export class FogPainter {
  private readonly near = noiseField(7);
  private readonly far = noiseField(19);
  private readonly image: ImageData;
  private time = 0;
  private burst = 0;

  constructor(private readonly context: CanvasRenderingContext2D) {
    this.image = context.createImageData(TITLE_WIDTH, TITLE_HEIGHT);
  }

  paint(dt: number): void {
    this.time += dt;
    this.burst = Math.max(0, this.burst - dt);
    if (Math.random() < dt / 9) this.burst = 0.12;
    const t = this.time;
    const data = this.image.data;
    const band = ((t * 18) % (TITLE_HEIGHT + 60)) - 30;
    const snow = this.burst > 0 ? 34 : 9;
    for (let y = 0; y < TITLE_HEIGHT; y++) {
      // Fog hangs low: thin at the top of the frame, thickest along the bottom third.
      const height = Math.min(1, Math.max(0, (y - 40) / 170));
      const bandGlow = Math.max(0, 1 - Math.abs(y - band) / 14) * 6;
      for (let x = 0; x < TITLE_WIDTH; x++) {
        const far = sample(this.far, x / 9 + t * 0.35, y / 9 + Math.sin(t * 0.05) * 2);
        const near = sample(this.near, x / 6 - t * 0.6, y / 7 + t * 0.08);
        const fog = (far * 0.5 + near * near * 0.9) * height * 52;
        const level = fog + bandGlow + (Math.random() - 0.5) * snow;
        // Few levels and a 4x4 ordered dither, as on the console.
        const dithered = Math.floor(level / 4 + BAYER[(y & 3) * 4 + (x & 3)]! / 16) * 4;
        const v = Math.max(0, Math.min(255, dithered));
        const i = (y * TITLE_WIDTH + x) * 4;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v + 2;
        data[i + 3] = 255;
      }
    }
    this.context.putImageData(this.image, 0, 0);
  }
}
