import { BufferGeometry, ConeGeometry, CylinderGeometry, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hashString, seededRandom } from '../random';

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

/** Low-poly tree models, one geometry per material so each part can be instanced. */
export function treeModel(kind: TreeKind): TreeModel {
  switch (kind) {
    case 'spruce':
      return spruce();
    case 'bare':
      return bareTree(0x8a7e70, 'bark_spruce');
    case 'birch':
      return bareTree(0xd8d4cc, 'bark_birch');
  }
}

function spruce(): TreeModel {
  const trunk = taperedLimb(0.17, 0.05, 9.5, 6);
  // Many short, open-bottomed tiers read as drooping branches rather than stacked cones.
  const tierCount = 7;
  const crown = Array.from({ length: tierCount }, (_, i) => {
    const t = i / (tierCount - 1);
    const radius = 0.35 + 1.75 * (1 - t);
    const height = 2.1 - t * 0.7;
    const y = 1.3 + i * 1.08;
    const tier = new ConeGeometry(radius, height, 7, 2, true).translate(0, y + height / 2, 0);
    return roughen(tier, `spruce${i}`, 0.28);
  });
  return {
    trunkRadius: 0.2,
    parts: [
      { geometry: trunk, texture: 'bark_spruce', uvScale: [2, 0.5], color: 0x8f8478 },
      {
        geometry: mergeGeometries(crown)!,
        texture: 'spruce_foliage',
        uvScale: [1.2, 1.2],
        color: 0x76826f,
        cutout: true,
      },
    ],
  };
}

function bareTree(color: number, texture: string): TreeModel {
  const random = seededRandom(hashString(texture));
  const limbs: BufferGeometry[] = [taperedLimb(0.2, 0.05, 7.5, 6)];
  for (let i = 0; i < 9; i++) {
    const height = 2.2 + random() * 4.6;
    const length = 1.2 + random() * 1.8 * (1 - height / 9);
    const yaw = i * 2.4 + random() * 0.6;
    const pitch = 0.5 + random() * 0.5;
    const limb = taperedLimb(0.07, 0.015, length, 4);
    limbs.push(place(limb, new Vector3(0, height, 0), new Euler(pitch, yaw, 0, 'YXZ')));
    const tip = new Vector3(0, length * 0.7, 0).applyEuler(new Euler(pitch, yaw, 0, 'YXZ')).add(new Vector3(0, height, 0));
    const twig = taperedLimb(0.03, 0.01, length * 0.6, 3);
    limbs.push(place(twig, tip, new Euler(pitch + 0.5, yaw + (random() - 0.5) * 1.6, 0, 'YXZ')));
  }
  return {
    trunkRadius: 0.22,
    parts: [{ geometry: mergeGeometries(limbs)!, texture, uvScale: [2, 0.5], color }],
  };
}

/** A cylinder that narrows toward the top, with its base at the origin. */
function taperedLimb(baseRadius: number, topRadius: number, length: number, sides: number): BufferGeometry {
  const geometry = new CylinderGeometry(topRadius, baseRadius, length, sides, Math.max(1, Math.round(length / 1.5)), true);
  return roughen(geometry.translate(0, length / 2, 0), `limb${length}`, 0.04);
}

function place(geometry: BufferGeometry, position: Vector3, rotation: Euler): BufferGeometry {
  return geometry.applyMatrix4(new Matrix4().compose(position, new Quaternion().setFromEuler(rotation), new Vector3(1, 1, 1)));
}

/**
 * Pushes vertices in and out by a random amount so trees don't look lathed. The offset is
 * keyed on the vertex position, so seam vertices that share a position stay joined.
 */
function roughen(geometry: BufferGeometry, seed: string, amount: number): BufferGeometry {
  const position = geometry.getAttribute('position');
  const v = new Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const key = `${seed}:${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    const random = seededRandom(hashString(key));
    const radial = 1 + (random() - 0.5) * 2 * amount;
    position.setXYZ(i, v.x * radial, v.y + (random() - 0.5) * amount, v.z * radial);
  }
  geometry.computeVertexNormals();
  // Non-indexed output lets every part of a tree merge into one geometry.
  return geometry.toNonIndexed();
}
