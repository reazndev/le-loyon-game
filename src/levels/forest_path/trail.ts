/** A walked path through the forest: a polyline in the XZ plane, in meters. */
export type Trail = readonly (readonly [x: number, z: number])[];

export interface TrailPoint {
  x: number;
  z: number;
  /** Distance from the query point. */
  distance: number;
  /** Unit direction of the trail at this point, from its first point toward its last. */
  dx: number;
  dz: number;
}

/** The closest point on any of the trails to (x, z). */
export function nearestOnTrails(trails: readonly Trail[], x: number, z: number): TrailPoint {
  let best: TrailPoint = { x, z, distance: Infinity, dx: 0, dz: -1 };
  for (const trail of trails) {
    for (let i = 1; i < trail.length; i++) {
      const [ax, az] = trail[i - 1]!;
      const [bx, bz] = trail[i]!;
      const sx = bx - ax;
      const sz = bz - az;
      const length2 = sx * sx + sz * sz;
      const t = length2 === 0 ? 0 : Math.min(1, Math.max(0, ((x - ax) * sx + (z - az) * sz) / length2));
      const px = ax + sx * t;
      const pz = az + sz * t;
      const distance = Math.hypot(x - px, z - pz);
      if (distance < best.distance) {
        const length = Math.sqrt(length2) || 1;
        best = { x: px, z: pz, distance, dx: sx / length, dz: sz / length };
      }
    }
  }
  return best;
}

export const distanceToTrails = (trails: readonly Trail[], x: number, z: number): number =>
  nearestOnTrails(trails, x, z).distance;

/** Points along a trail every `step` meters, each with the distance walked so far. */
export function resample(trail: Trail, step: number): { x: number; z: number; along: number }[] {
  const points: { x: number; z: number; along: number }[] = [];
  let along = 0;
  for (let i = 1; i < trail.length; i++) {
    const [ax, az] = trail[i - 1]!;
    const [bx, bz] = trail[i]!;
    const length = Math.hypot(bx - ax, bz - az);
    const count = Math.max(1, Math.ceil(length / step));
    for (let j = i === 1 ? 0 : 1; j <= count; j++) {
      const t = j / count;
      points.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, along: along + length * t });
    }
    along += length;
  }
  return points;
}

/** The point `meters` along a trail from its start, with the trail's direction there. */
export function pointAlong(trail: Trail, meters: number): TrailPoint {
  let left = meters;
  for (let i = 1; i < trail.length; i++) {
    const [ax, az] = trail[i - 1]!;
    const [bx, bz] = trail[i]!;
    const length = Math.hypot(bx - ax, bz - az);
    if (left <= length || i === trail.length - 1) {
      const t = length === 0 ? 0 : Math.min(1, left / length);
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, distance: 0, dx: (bx - ax) / length, dz: (bz - az) / length };
    }
    left -= length;
  }
  const [x, z] = trail[0]!;
  return { x, z, distance: 0, dx: 0, dz: -1 };
}

/** Level yaw in degrees that faces along (dx, dz). 0 faces -Z, 90 faces -X. */
export const yawToward = (dx: number, dz: number): number => (Math.atan2(-dx, -dz) * 180) / Math.PI;

/** A point `side` meters to the right of a trail (left when negative), seen walking along it. */
export const beside = (trail: Trail, meters: number, side: number) => {
  const p = pointAlong(trail, meters);
  return { x: p.x - p.dz * side, z: p.z + p.dx * side, yaw: yawToward(p.dx, p.dz) };
};
