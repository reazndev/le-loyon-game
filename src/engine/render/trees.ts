import type { BufferGeometry } from 'three';

export type TreeKind = 'spruce' | 'bare' | 'birch';

export interface TreePart {
  geometry: BufferGeometry;
  texture: string;
  /** UV scale for the part's texture. */
  uvScale: [number, number];
  color: number;
  /** Cut out transparent texels and draw both faces, for ragged needle tiers. */
  cutout?: boolean;
}

export interface TreeModel {
  parts: TreePart[];
  /** Trunk radius at the base, used for the collider. */
  trunkRadius: number;
}
