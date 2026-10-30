import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, PlaneGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Geometry for the level kit. UVs are in meters so a material's UV scale sets texel density,
 * and faces are split into cells of about `cell` meters. Vertex lighting needs those extra
 * vertices: a flashlight on a single large quad lights nothing.
 */

const segments = (length: number, cell: number) => Math.max(1, Math.ceil(length / cell));

function meterUvs(geometry: BufferGeometry, width: number, height: number): BufferGeometry {
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * width, uv.getY(i) * height);
  return geometry;
}

function face(width: number, height: number, cell: number): BufferGeometry {
  return meterUvs(new PlaneGeometry(width, height, segments(width, cell), segments(height, cell)), width, height);
}

/** A box with its origin at the bottom center. */
export function boxGeometry(w: number, h: number, d: number, cell: number): BufferGeometry {
  const faces = [
    face(w, h, cell).translate(0, h / 2, d / 2),
    face(w, h, cell).rotateY(Math.PI).translate(0, h / 2, -d / 2),
    face(d, h, cell).rotateY(Math.PI / 2).translate(w / 2, h / 2, 0),
    face(d, h, cell).rotateY(-Math.PI / 2).translate(-w / 2, h / 2, 0),
    face(w, d, cell).rotateX(-Math.PI / 2).translate(0, h, 0),
    face(w, d, cell).rotateX(Math.PI / 2),
  ];
  return mergeGeometries(faces)!;
}

/** A horizontal plane facing up, centered on its origin. */
export function planeGeometry(w: number, d: number, cell: number): BufferGeometry {
  return face(w, d, cell).rotateX(-Math.PI / 2);
}

/** A cylinder with its origin at the bottom center. */
export function cylinderGeometry(r: number, h: number, radialSegments: number, cell: number): BufferGeometry {
  const geometry = new CylinderGeometry(r, r, h, radialSegments, segments(h, cell));
  return meterUvs(geometry, 2 * Math.PI * r, h).translate(0, h / 2, 0);
}

/** A heightfield centered on its origin. `height` takes local x and z in meters. */
export function terrainGeometry(
  w: number,
  d: number,
  cell: number,
  height: (x: number, z: number) => number,
): BufferGeometry {
  const geometry = planeGeometry(w, d, cell);
  const position = geometry.getAttribute('position');
  const colors: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    position.setY(i, height(x, z));
    // Darker and lighter patches per vertex, the way PS1 ground was hand-shaded with vertex colors.
    const tone = 0.9 + 0.12 * Math.sin(x * 0.7 + Math.sin(z * 0.43) * 2.1) * Math.cos(z * 0.61 - x * 0.17) + (hash2(x, z) - 0.5) * 0.12;
    colors.push(tone, tone, tone * 0.97);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function hash2(x: number, z: number): number {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** A vertical quad with its origin at the bottom center, for billboards. */
export function spriteGeometry(w: number, h: number): BufferGeometry {
  return new PlaneGeometry(w, h).translate(0, h / 2, 0);
}

/**
 * A gable roof: a triangular prism with its ridge along X, origin at the bottom center.
 * `h` is the ridge height above the eaves.
 */
export function gableGeometry(w: number, d: number, h: number, cell: number): BufferGeometry {
  const slope = Math.hypot(d / 2, h);
  const tilt = Math.atan2(h, d / 2);
  const side = (sign: number) =>
    face(w, slope, cell)
      .rotateX(-Math.PI / 2 + tilt * sign)
      .translate(0, h / 2, (sign * d) / 4);
  const gableEnd = (sign: number) => {
    const geometry = new BufferGeometry();
    const x = (sign * w) / 2;
    const corners = sign > 0 ? [d / 2, -d / 2] : [-d / 2, d / 2];
    geometry.setAttribute('position', new Float32BufferAttribute([x, 0, corners[0]!, x, 0, corners[1]!, x, h, 0], 3));
    geometry.setAttribute('uv', new Float32BufferAttribute([0, 0, d, 0, d / 2, h], 2));
    geometry.computeVertexNormals();
    return geometry;
  };
  return mergeGeometries([side(1).toNonIndexed(), side(-1).toNonIndexed(), gableEnd(1), gableEnd(-1)])!;
}
