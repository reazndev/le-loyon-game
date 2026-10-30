/** Small canvas helpers for pixel art, drawn at 1x and shown with nearest-neighbor scaling. */

export type Palette = Record<string, string>;

/** Colors shared by every pixel-art grid. A '.' is transparent. */
const basePalette: Palette = {
  k: '#1a1916',
  w: '#f4f2ea',
  g: '#c3bfb3',
  G: '#807b6f',
  b: '#d9d1b9',
  B: '#a89e84',
  t: '#2a8a86',
  n: '#22356f',
  l: '#3a6ad0',
  L: '#8ab0f0',
  e: '#3a9a4a',
  r: '#c03028',
  y: '#e8cf48',
  o: '#e07a20',
};

export function canvas(width: number, height: number, className = 'px'): HTMLCanvasElement {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  element.className = className;
  return element;
}

export function context2d(element: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = element.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('2D canvas unavailable');
  context.imageSmoothingEnabled = false;
  return context;
}

/** Paints rows of palette characters, one character per pixel. */
export function paintGrid(
  context: CanvasRenderingContext2D,
  rows: readonly string[],
  palette: Palette = basePalette,
  x = 0,
  y = 0,
): void {
  rows.forEach((row, j) =>
    [...row].forEach((char, i) => {
      const color = palette[char];
      if (!color) return;
      context.fillStyle = color;
      context.fillRect(x + i, y + j, 1, 1);
    }),
  );
}

/** A canvas holding one pixel-art grid. */
export function gridCanvas(rows: readonly string[], palette: Palette = basePalette): HTMLCanvasElement {
  const element = canvas(Math.max(...rows.map((r) => r.length)), rows.length);
  paintGrid(context2d(element), rows, { ...basePalette, ...palette });
  return element;
}

export interface TextStyle {
  font: string;
  color: string;
  /** Pixels of solid shadow down and right, as on 90s logos. */
  shadow?: string;
  padding?: number;
}

/**
 * Draws text without anti-aliasing: each pixel is either the text color or clear, the way
 * text looked on a 1998 screen without font smoothing.
 */
export function bitmapText(text: string, style: TextStyle): HTMLCanvasElement {
  const measure = context2d(canvas(1, 1));
  measure.font = style.font;
  const metrics = measure.measureText(text);
  const pad = style.padding ?? 2;
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent);
  const height = ascent + Math.ceil(metrics.actualBoundingBoxDescent) + pad * 2 + 1;
  const element = canvas(Math.ceil(metrics.width) + pad * 2 + 1, height);
  const context = context2d(element);
  context.font = style.font;
  context.fillStyle = '#000';
  context.fillText(text, pad, pad + ascent);
  const mask = context.getImageData(0, 0, element.width, element.height);
  context.clearRect(0, 0, element.width, element.height);
  const solid = (color: string, dx: number) => {
    context.fillStyle = color;
    for (let j = 0; j < mask.height; j++)
      for (let i = 0; i < mask.width; i++) if (mask.data[(j * mask.width + i) * 4 + 3]! >= 110) context.fillRect(i + dx, j + dx, 1, 1);
  };
  if (style.shadow) solid(style.shadow, 1);
  solid(style.color, 0);
  return element;
}

/** A repeatable pseudo-random sequence, so generated pictures look the same every time. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Turns a canvas into a data URL once, for use as a CSS background tile. */
export function tileUrl(paint: () => HTMLCanvasElement): () => string {
  let url: string | null = null;
  return () => (url ??= paint().toDataURL());
}
