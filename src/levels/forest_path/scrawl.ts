import { CanvasTexture, NearestFilter, PlaneGeometry } from 'three';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { createPs1Material } from '../../engine/render/ps1Material';

/**
 * Writing on a surface: graffiti, stencils, a carving. There are no texture files for words,
 * so this paints a small canvas, samples it nearest-neighbor like every other texture, and
 * puts it on a plane that faces +Z. Transparent pixels are cut out.
 */
export function scrawl(
  kit: LevelKit,
  size: { w: number; h: number },
  pixels: [width: number, height: number],
  draw: (g: CanvasRenderingContext2D) => void,
): MeshBuilder {
  const builder = kit.mesh(new PlaneGeometry(size.w, size.h).translate(0, size.h / 2, 0));
  builder.mesh.material.dispose();
  builder.mesh.material = createPs1Material({ map: paintedTexture(pixels, draw), alphaTest: 0.5 });
  return builder;
}

/** A small canvas painted in code, sampled nearest-neighbor like every other texture. */
export function paintedTexture(pixels: [width: number, height: number], draw: (g: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = pixels;
  const g = canvas.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  draw(g);
  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/** One line of hand-sprayed or hand-written text, slightly tilted. */
export function handText(g: CanvasRenderingContext2D, text: string, x: number, y: number, options: { size: number; color: string; angle?: number; font?: string }): void {
  g.save();
  g.translate(x, y);
  g.rotate(((options.angle ?? 0) * Math.PI) / 180);
  g.font = `${options.size}px ${options.font ?? '"Comic Sans MS", "Marker Felt", sans-serif'}`;
  g.fillStyle = options.color;
  g.textBaseline = 'middle';
  g.fillText(text, 0, 0);
  g.restore();
}
