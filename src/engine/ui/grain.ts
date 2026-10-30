const cache = new Map<string, string>();

/**
 * A small tile of mottled color as a data URL, for paper, card, and stone backgrounds. CSS scales it
 * up with nearest-neighbor filtering, so the grain reads as texels like the 3D frame.
 */
export function grainTexture(r: number, g: number, b: number, size = 64): string {
  const key = `${r},${g},${b},${size}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(size, size);
  let seed = r * 31 + g * 17 + b;
  const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  // Two scales of noise: fine grain over soft blotches eight texels across.
  const blotches = Array.from({ length: (size / 8) ** 2 }, () => (random() - 0.5) * 10);
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const shade = (random() - 0.5) * 12 + blotches[Math.floor(y / 8) * (size / 8) + Math.floor(x / 8)]!;
    image.data.set([r + shade, g + shade, b + shade * 0.8, 255], i * 4);
  }
  context.putImageData(image, 0, 0);
  const url = canvas.toDataURL();
  cache.set(key, url);
  return url;
}
