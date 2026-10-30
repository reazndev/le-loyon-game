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

/** A flat fan over a ring, facing up, or down with `under`. */
function capFan(ring: Point[], under = false): BufferGeometry {
  const center: Point = [
    ring.reduce((s, p) => s + p[0], 0) / ring.length,
    ring[0]![1],
    ring.reduce((s, p) => s + p[2], 0) / ring.length,
  ];
  const positions = ring.flatMap((p, i) => {
    const next = ring[(i + 1) % ring.length]!;
    return under ? [...center, ...p, ...next] : [...center, ...next, ...p];
  });
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

/** One section of a lathe: an ellipse at height `y`. */
export interface Ring {
  y: number;
  /** Half-width along X. */
  rx: number;
  /** Half-depth along Z. */
  rz: number;
  /** Offset of the ring's center along Z; negative is forward. */
  z?: number;
  /** Pushes the front of the ring forward, fading out toward the sides: a brow, a chin, a fold. */
  front?: number;
  /** Adds to the radius of every other column, for folds in cloth. */
  ripple?: number;
}

/**
 * A flat-shaded solid of elliptical rings, listed from bottom to top, with a flat facet facing
 * -Z. A full lathe is closed with a cap at both ends. `arc` keeps part of the way round, as
 * fractions of a turn counted from the front through +X, for shells open at the face such as a
 * hood; arcs have no caps.
 */
export function lathe(rings: Ring[], sides: number, arc?: [number, number]): BufferGeometry {
  const [a0, a1] = arc ?? [0.5 / sides, 1 + 0.5 / sides];
  const columns = arc ? Math.max(1, Math.round(sides * (a1 - a0))) : sides;
  const at = (ring: Ring, j: number): Point => {
    const angle = (a0 + ((a1 - a0) * j) / columns) * Math.PI * 2;
    const fold = ring.ripple ? (j % 2 ? ring.ripple : -ring.ripple) : 0;
    const forward = (ring.front ?? 0) * Math.max(0, Math.cos(angle)) ** 2;
    return [Math.sin(angle) * (ring.rx + fold), ring.y, (ring.z ?? 0) - Math.cos(angle) * (ring.rz + fold) - forward];
  };
  const faces = rings.slice(1).flatMap((upper, i) => {
    const lower = rings[i]!;
    return Array.from({ length: columns }, (_, j): [Point, Point, Point, Point] => [at(lower, j + 1), at(lower, j), at(upper, j), at(upper, j + 1)]);
  });
  if (arc) return quads(faces);
  const ringPoints = (ring: Ring) => Array.from({ length: columns }, (_, j) => at(ring, j));
  return mergeAll([quads(faces), capFan(ringPoints(rings.at(-1)!)), capFan(ringPoints(rings[0]!), true)]);
}

/** Splits a non-indexed geometry into the triangles that face -Z by more than `facing` (0 to 1) and the rest. */
export function splitFront(geometry: BufferGeometry, facing: number): [front: BufferGeometry, rest: BufferGeometry] {
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  const parts = { front: { position: [] as number[], uv: [] as number[] }, rest: { position: [] as number[], uv: [] as number[] } };
  for (let t = 0; t < position.count; t += 3) {
    const [a, b, c] = [t, t + 1, t + 2].map((i) => [position.getX(i), position.getY(i), position.getZ(i)] as Point) as [Point, Point, Point];
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nz = e1[0]! * e2[1]! - e1[1]! * e2[0]!;
    const length = Math.hypot(e1[1]! * e2[2]! - e1[2]! * e2[1]!, e1[2]! * e2[0]! - e1[0]! * e2[2]!, nz) || 1;
    const part = nz / length < -facing ? parts.front : parts.rest;
    [t, t + 1, t + 2].forEach((i) => {
      part.position.push(position.getX(i), position.getY(i), position.getZ(i));
      part.uv.push(uv.getX(i), uv.getY(i));
    });
  }
  return [parts.front, parts.rest].map((part) => {
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(part.position, 3));
    result.setAttribute('uv', new Float32BufferAttribute(part.uv, 2));
    result.computeVertexNormals();
    return result;
  }) as [BufferGeometry, BufferGeometry];
}

/**
 * Projects a picture onto geometry from the front: the box from `x0` to `x1` and `y0` to `y1`
 * gets the whole texture, as a face photo on a head. Points outside take the edge texels.
 */
export function projectFront(geometry: BufferGeometry, box: { x0: number; x1: number; y0: number; y1: number }): BufferGeometry {
  const position = geometry.getAttribute('position');
  const clamp = (v: number) => Math.min(0.99, Math.max(0.01, v));
  const uvs = Array.from({ length: position.count }, (_, i) => [
    // Seen from the front, +X is on the viewer's left, which is the left of the picture.
    clamp((box.x1 - position.getX(i)) / (box.x1 - box.x0)),
    clamp((position.getY(i) - box.y0) / (box.y1 - box.y0)),
  ]).flat();
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  return geometry;
}

/** Darkens a geometry toward its bottom with vertex colors: `bottom` brightness at `y0`, full at `y1`. */
export function shadeDown(geometry: BufferGeometry, y0: number, y1: number, bottom: number): BufferGeometry {
  const position = geometry.getAttribute('position');
  const colors = Array.from({ length: position.count }, (_, i) => {
    const t = Math.min(1, Math.max(0, (position.getY(i) - y0) / (y1 - y0)));
    const v = bottom + (1 - bottom) * t;
    return [v, v, v];
  }).flat();
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}
