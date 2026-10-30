import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import { resample, yawToward, type Trail } from '../forest_path/trail';

export type Height = (x: number, z: number) => number;

/**
 * A gravel path laid over the slope, following the ground. The forest's `trailStrip` is the same
 * ribbon in trodden mud; this one has straight edges and gravel, as a path the commune keeps.
 */
export function gravelPath(kit: LevelKit, trail: Trail, width: number, height: Height): void {
  const points = resample(trail, 0.7);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  points.forEach((p, i) => {
    const prev = points[Math.max(0, i - 1)]!;
    const next = points[Math.min(points.length - 1, i + 1)]!;
    const length = Math.hypot(next.x - prev.x, next.z - prev.z) || 1;
    const [lx, lz] = [-(next.z - prev.z) / length, (next.x - prev.x) / length];
    [-1, 1].forEach((side) => {
      const x = p.x + (lx * width * side) / 2;
      const z = p.z + (lz * width * side) / 2;
      positions.push(x, height(x, z) + 0.05, z);
      uvs.push((width * side) / 2, p.along);
    });
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  kit.mesh(geometry).texture('gravel_path', { tile: 1.8 }).color(0xa6a296).doubleSided();
}

/**
 * Barbed wire on wooden posts along one side of each leg of the path, `offset` meters out. Posts
 * every few meters; two strands of wire sag between them.
 */
export function barbedWire(kit: LevelKit, legs: Trail[], offset: number): void {
  legs.forEach((leg) => {
    const [a, b] = [leg[0]!, leg[leg.length - 1]!];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [dx, dz] = [(b[0] - a[0]) / length, (b[1] - a[1]) / length];
    const [ox, oz] = [-dz * offset, dx * offset];
    const count = Math.max(2, Math.round(length / 2.8));
    const posts = Array.from({ length: count + 1 }, (_, i) => ({ x: a[0] + ox + dx * (length * i) / count, z: a[1] + oz + dz * (length * i) / count }));
    posts.forEach((p, i) =>
      kit
        .box({ w: 0.09, h: 1.15 + (i % 3) * 0.04, d: 0.09 })
        .texture('bark_spruce', { tile: 0.6 })
        .color(0x5e554a)
        .at(p.x, -0.05, p.z)
        .rotY(i * 23)
        .onGround(),
    );
    const span = length / count;
    const yaw = yawToward(dx, dz) + 90;
    posts.slice(1).forEach((p, i) => {
      const q = posts[i]!;
      [0.55, 0.95].forEach((h) =>
        kit
          .box({ w: span, h: 0.012, d: 0.012 })
          .color(0x3a3632)
          .at((p.x + q.x) / 2, h - 0.04, (p.z + q.z) / 2)
          .rotY(yaw)
          .onGround(),
      );
    });
  });
}
