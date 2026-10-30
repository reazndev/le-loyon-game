import { BufferGeometry, Float32BufferAttribute } from 'three';

/**
 * Low-poly body parts. Every part is a closed, flat-shaded solid with UVs in meters, so cloth
 * and camo textures keep one texel size across parts. Origins sit at the joint the part turns
 * around, which makes posing a matter of setting rotations.
 */

type Point = [number, number, number];

/** Builds flat-shaded quads (two triangles each) from corner lists in counterclockwise order seen from outside. */
function quads(faces: [Point, Point, Point, Point][]): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  faces.forEach(([a, b, c, d]) => {
    const width = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const height = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
    const uv: [number, number][] = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ];
    [0, 1, 2, 0, 2, 3].forEach((i) => {
      positions.push(...[a, b, c, d][i]!);
      uvs.push(...uv[i]!);
    });
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

export interface Section {
  /** Width along X. */
  w: number;
  /** Depth along Z. */
  d: number;
  /** Offset of the section center along Z, to lean a part forward or back. */
  z?: number;
}

/**
 * A box whose top and bottom sections differ, from `top` at y = `y0` to `bottom` at y = `y1`.
 * Limbs hang down from their joint with y0 = 0 and y1 = -length.
 */
export function taperedBox(top: Section, bottom: Section, y0: number, y1: number): BufferGeometry {
  const ring = (s: Section, y: number): Point[] => {
    const z = s.z ?? 0;
    // Counterclockwise from above: front left, front right, back right, back left. Front is -Z.
    return [
      [-s.w / 2, y, z - s.d / 2],
      [s.w / 2, y, z - s.d / 2],
      [s.w / 2, y, z + s.d / 2],
      [-s.w / 2, y, z + s.d / 2],
    ];
  };
  const t = ring(top, y0);
  const b = ring(bottom, y1);
  return quads([
    [b[1]!, b[0]!, t[0]!, t[1]!], // front, facing -Z
    [b[3]!, b[2]!, t[2]!, t[3]!], // back
    [b[2]!, b[1]!, t[1]!, t[2]!], // right
    [b[0]!, b[3]!, t[3]!, t[0]!], // left
    [t[0]!, t[3]!, t[2]!, t[1]!], // top
    [b[3]!, b[0]!, b[1]!, b[2]!], // bottom
  ]);
}

/** A plain box spanning the heights `ya` and `yb`, in either order. */
export function block(w: number, d: number, ya: number, yb: number, z = 0): BufferGeometry {
  return taperedBox({ w, d, z }, { w, d, z }, Math.max(ya, yb), Math.min(ya, yb));
}

/**
 * An open shell around a head: top, back, and both sides, leaving the face free. For hoods
 * and headscarves.
 */
export function hoodShell(w: number, d: number, y0: number, y1: number, front: number): BufferGeometry {
  const t = 0.03;
  const back = d / 2;
  const sides = [-1, 1].map((side) => block(t, back - front, y0, y1, (front + back) / 2).translate((side * (w - t)) / 2, 0, 0));
  return mergeAll([block(w, t, y0, y1, back - t / 2), block(w, back - front, y1 - t, y1, (front + back) / 2), ...sides]);
}

/**
 * A ring of `sides` columns from `y0` to `y1`, each with its own radius at top and bottom, so a
 * cape can hang in uneven folds. Radii lists run counterclockwise from the front.
 */
export function drape(topRadii: number[], bottomRadii: number[], y0: number, y1: number, depthScale = 1): BufferGeometry {
  const sides = topRadii.length;
  const at = (radii: number[], i: number, y: number): Point => {
    const angle = (i / sides) * Math.PI * 2;
    const r = radii[i % sides]!;
    return [Math.sin(angle) * r, y, -Math.cos(angle) * r * depthScale];
  };
  const faces: [Point, Point, Point, Point][] = [];
  for (let i = 0; i < sides; i++) {
    faces.push([at(bottomRadii, i + 1, y1), at(bottomRadii, i, y1), at(topRadii, i, y0), at(topRadii, i + 1, y0)]);
  }
  const top = Array.from({ length: sides }, (_, i) => at(topRadii, i, y0));
  const cap = capFan(top);
  return mergeAll([quads(faces), cap]);
}

function capFan(ring: Point[]): BufferGeometry {
  const center: Point = [
    ring.reduce((s, p) => s + p[0], 0) / ring.length,
    ring[0]![1],
    ring.reduce((s, p) => s + p[2], 0) / ring.length,
  ];
  const positions = ring.flatMap((p, i) => [...center, ...ring[(i + 1) % ring.length]!, ...p]);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(new Array<number>((positions.length / 3) * 2).fill(0), 2));
  geometry.computeVertexNormals();
  return geometry;
}

/** Concatenates non-indexed geometries that all carry position and uv. */
export function mergeAll(parts: BufferGeometry[]): BufferGeometry {
  const merged = new BufferGeometry();
  (['position', 'uv'] as const).forEach((name) => {
    const size = name === 'position' ? 3 : 2;
    const values = parts.flatMap((part) => Array.from(part.getAttribute(name).array as ArrayLike<number>));
    merged.setAttribute(name, new Float32BufferAttribute(values, size));
  });
  merged.computeVertexNormals();
  return merged;
}

/** A flat quad facing -Z, centered on its origin, with UVs given as a crop of the texture. */
export function facePlate(w: number, h: number, crop: { u0: number; v0: number; u1: number; v1: number }): BufferGeometry {
  const geometry = new BufferGeometry();
  const x = w / 2;
  const y = h / 2;
  geometry.setAttribute('position', new Float32BufferAttribute([x, -y, 0, -x, -y, 0, -x, y, 0, x, -y, 0, -x, y, 0, x, y, 0], 3));
  const { u0, v0, u1, v1 } = crop;
  geometry.setAttribute('uv', new Float32BufferAttribute([u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1], 2));
  geometry.computeVertexNormals();
  return geometry;
}
