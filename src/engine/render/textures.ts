import { NearestFilter, RepeatWrapping, Texture } from 'three';
import { paintProceduralTexture } from './proceduralTextures';

const textureUrl = (name: string) => `${import.meta.env.BASE_URL}assets/textures/${name}.png`;

/**
 * Loads textures by name from `public/assets/textures/<name>.png`. Each texture starts as a
 * procedural placeholder and swaps in the file when it loads, so a missing file only means
 * the placeholder stays.
 */
export class TextureLibrary {
  private readonly cache = new Map<string, Texture>();

  get(name: string): Texture {
    const cached = this.cache.get(name);
    if (cached) return cached;
    const texture = new Texture<HTMLCanvasElement | HTMLImageElement>(paintProceduralTexture(name));
    texture.needsUpdate = true;
    applyPs1Sampling(texture);
    this.cache.set(name, texture);
    loadImage(textureUrl(name)).then(
      (image) => {
        // Disposing frees the GPU copy, which was sized for the placeholder.
        texture.dispose();
        texture.image = image;
        texture.needsUpdate = true;
      },
      () => undefined,
    );
    return texture;
  }
}

/** Nearest filtering, no mipmaps, and tiling, as on the PS1. */
function applyPs1Sampling(texture: Texture): void {
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}
