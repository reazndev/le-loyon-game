import { BoxGeometry, Euler, Quaternion, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hashString, seededRandom } from '../../engine/random';
import type { Trail } from './trail';

/** The layout of an old wire fence: posts along a line, each leaning its own way, the last one down. */

export type Point = readonly [x: number, y: number, z: number];

export interface FencePost {
  x: number;
  z: number;
  /** Tilt in radians around X and Z, as Euler angles with no turn. */
  lean: { x: number; z: number };
  /** Rotted through at the foot and lying in the moss. */
  fallen: boolean;
}

const MAX_LEAN = 0.16;

/** Posts about `step` meters apart along `points`, one at each end. The last post has fallen. */
export function fencePosts(points: Trail, step: number, seed: string): FencePost[] {
  const random = seededRandom(hashString(seed));
  const along = points.slice(1).flatMap(([x1, z1], i) => {
    const [x0, z0] = points[i]!;
    const count = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / step));
    return Array.from({ length: count }, (_, k) => [x0 + ((x1 - x0) * k) / count, z0 + ((z1 - z0) * k) / count] as const);
  });
  const last = points[points.length - 1]!;
  return [...along, last].map(([x, z], i, all) => ({
    x,
    z,
    lean: { x: (random() - 0.5) * 2 * MAX_LEAN, z: (random() - 0.5) * 2 * MAX_LEAN },
    fallen: i === all.length - 1,
  }));
}

/** Where a point `up` meters along a leaning post sits, from the post's foot at `base`. */
export function alongPost(post: FencePost, base: Point, up: number): Point {
  const v = new Vector3(0, up, 0).applyEuler(new Euler(post.lean.x, 0, post.lean.z));
  return [base[0] + v.x, base[1] + v.y, base[2] + v.z];
}

/** A wire from `a` to `b` sagging `sag` meters at the middle, as `pieces` straight lengths. */
export function sagging(a: Point, b: Point, sag: number, pieces = 4): Point[] {
  return Array.from({ length: pieces + 1 }, (_, i) => {
    const t = i / pieces;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 4 * sag * t * (1 - t), a[2] + (b[2] - a[2]) * t] as const;
  });
}

/**
 * Thin bars along each path, merged into one geometry in world coordinates, with a knot of barb
 * every `barbEvery` meters.
 */
export function wireGeometry(paths: readonly Point[][], thickness: number, barbEvery: number): BufferGeometry {
  const up = new Vector3(0, 0, 1);
  const parts = paths.flatMap((path) =>
    path.slice(1).flatMap((b, i) => {
      const a = path[i]!;
      const from = new Vector3(...a);
      const span = new Vector3(...b).sub(from);
      const length = span.length();
      const turn = new Quaternion().setFromUnitVectors(up, span.clone().normalize());
      const bar = new BoxGeometry(thickness, thickness, length).applyQuaternion(turn).translate(...from.clone().addScaledVector(span, 0.5).toArray());
      const barbs = Array.from({ length: Math.floor(length / barbEvery) }, (_, k) => {
        const at = from.clone().addScaledVector(span, (k + 0.5) / Math.floor(length / barbEvery));
        return new BoxGeometry(thickness * 2.6, thickness * 2.6, thickness * 2.6).rotateY(Math.PI / 4).rotateX(Math.PI / 4).translate(at.x, at.y, at.z);
      });
      return [bar, ...barbs];
    }),
  );
  return mergeGeometries(parts.map((g) => g.toNonIndexed()))!;
}
