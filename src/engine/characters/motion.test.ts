import { describe, expect, it } from 'vitest';
import { angleDelta, headingOf, Route } from './motion';

describe('headingOf', () => {
  it('uses the level yaw convention', () => {
    expect(headingOf(0, -1)).toBeCloseTo(0);
    expect(headingOf(-1, 0)).toBeCloseTo(Math.PI / 2);
    expect(headingOf(1, 0)).toBeCloseTo(-Math.PI / 2);
    expect(Math.abs(headingOf(0, 1))).toBeCloseTo(Math.PI);
  });
});

describe('angleDelta', () => {
  it('takes the short way round', () => {
    expect(angleDelta(0.1, -0.1)).toBeCloseTo(-0.2);
    expect(angleDelta(3, -3)).toBeCloseTo(2 * Math.PI - 6);
    expect(angleDelta(-3, 3)).toBeCloseTo(6 - 2 * Math.PI);
  });
});

/** Walks a body along a route at `speed` and returns the waypoints reached, in order. */
function walk(route: Route, speed: number, seconds: number, dt = 0.1): number[] {
  const at = { x: 0, z: 0 };
  const reached: number[] = [];
  for (let t = 0; t < seconds; t += dt) {
    const step = route.step(at, speed * dt, dt);
    if (step.arrived !== null) reached.push(step.arrived);
    if (!step.target) continue;
    const dx = step.target.x - at.x;
    const dz = step.target.z - at.z;
    const length = Math.hypot(dx, dz);
    const move = Math.min(length, speed * dt);
    at.x += (dx / length) * move;
    at.z += (dz / length) * move;
  }
  return reached;
}

describe('Route', () => {
  it('visits each point once and finishes', () => {
    const route = new Route([
      { x: 0, z: -1 },
      { x: 1, z: -1 },
    ]);
    expect(walk(route, 1, 5)).toEqual([0, 1]);
    expect(route.done).toBe(true);
  });

  it('stands at a point for its wait', () => {
    const route = new Route([
      { x: 0, z: -1, wait: 2 },
      { x: 0, z: 0 },
    ]);
    expect(walk(route, 1, 2)).toEqual([0]);
    expect(route.standing).toBe(true);
    expect(walk(route, 1, 3)).toEqual([1]);
  });

  it('starts over when it loops', () => {
    const route = new Route(
      [
        { x: 0, z: -1 },
        { x: 0, z: 0 },
      ],
      true,
    );
    expect(walk(route, 1, 4.5)).toEqual([0, 1, 0, 1]);
    expect(route.done).toBe(false);
  });

  it('is done at once when empty', () => {
    expect(new Route([]).step({ x: 0, z: 0 }, 1, 0.1).done).toBe(true);
  });
});
