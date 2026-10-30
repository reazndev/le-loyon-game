import { PlaneGeometry, type BufferGeometry } from 'three';

/** A tarpaulin thrown over a low heap and left: flat over the top, sagging down to the ground all round. */

export interface Heap {
  /** Size of the flat top, along X and Z. */
  w: number;
  d: number;
  /** Height of the top. */
  h: number;
  /** How far the cloth spreads past the top before it reaches the ground. */
  skirt: number;
}

/** Height of the cloth at (x, z) from the heap's center: full over the top, falling off across the skirt. */
export function drape(heap: Heap, x: number, z: number): number {
  const out = Math.hypot(Math.max(Math.abs(x) - heap.w / 2, 0), Math.max(Math.abs(z) - heap.d / 2, 0));
  const fall = Math.min(out / heap.skirt, 1);
  // Folds that sink between whatever is under it.
  const folds = 0.04 * Math.sin(x * 7.1 + z * 2.3) * Math.cos(z * 5.3 - x);
  return Math.max(0.02, heap.h * (1 - fall ** 0.7) + folds * (1 - fall));
}

/** The cloth as one mesh standing on its center, with UVs in meters. */
export function tarpGeometry(heap: Heap, cell = 0.16): BufferGeometry {
  const w = heap.w + 2 * heap.skirt;
  const d = heap.d + 2 * heap.skirt;
  const geometry = new PlaneGeometry(w, d, Math.ceil(w / cell), Math.ceil(d / cell)).rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    const [x, z] = [position.getX(i), position.getZ(i)];
    position.setY(i, drape(heap, x, z));
    uv.setXY(i, x, z);
  }
  geometry.computeVertexNormals();
  return geometry;
}
