import type { LevelKit } from '../../game/kit/levelKit';
import { scatter } from '../../game/kit/scatter';
import { distanceToTrails } from '../forest_path/trail';
import { rock, trailStrip, undergrowth, woodland } from '../forest_path/woods';
import { BOUNDS, FIELD, FOREST_EDGE, forestTrack, GATE, fieldHeight, SHAPE, STUMP } from './layout';

/**
 * The field behind the farm: wet pasture climbing west between two fences to the Bois-Noir,
 * the gate behind the tool shed, and the first spruce of the forest with a track into it.
 */

export function land(kit: LevelKit): void {
  const w = BOUNDS.x1 - BOUNDS.x0 + 16;
  const d = BOUNDS.z1 - BOUNDS.z0 + 16;
  const cx = (BOUNDS.x0 + BOUNDS.x1) / 2;
  const cz = (BOUNDS.z0 + BOUNDS.z1) / 2;
  kit
    .terrain({ w, d, cell: 2, height: (x, z) => fieldHeight(x + cx, z + cz) })
    .texture('pasture', { tile: 4 })
    .color(0x868a72)
    .at(cx, 0, cz)
    .walkable('grass');
  trailStrip(kit, forestTrack, 1.4, fieldHeight);
  scatter({ x: -30, z: -6, w: 90, d: 50, count: 520, seed: 'yerly-tufts', spacing: 1.2, scale: [0.6, 1.3], avoid: (x, z) => x > -18 && z > -14 && z < 16 }).forEach((s) =>
    kit.sprite('grass_tuft', { w: 0.85 * s.scale!, h: 0.5 * s.scale! }).color(0x7c7e68).at(s.x, -0.05, s.z).onGround(),
  );
}

/** Post-and-wire fences along both sides of the field, and the gate standing open. */
export function fences(kit: LevelKit): void {
  const fence = (x0: number, x1: number, z: number) => {
    const posts = Math.round((x1 - x0) / 3);
    for (let i = 0; i <= posts; i++) {
      const x = x0 + ((x1 - x0) * i) / posts;
      kit.box({ w: 0.1, h: 1.2, d: 0.1 }).texture('bark_spruce', { tile: 0.6 }).color(0x5e554a).at(x, -0.05, z).rotY(i * 31).onGround();
      if (i === 0) continue;
      const px = x0 + ((x1 - x0) * (i - 1)) / posts;
      const [ya, yb] = [fieldHeight(px, z), fieldHeight(x, z)];
      [0.55, 0.95].forEach((h) =>
        kit
          .box({ w: Math.hypot(x - px, yb - ya), h: 0.015, d: 0.015 })
          .color(0x3a3632)
          .at((x + px) / 2, (ya + yb) / 2 + h, z)
          // The wire follows the slope between posts.
          .object.rotation.set(0, 0, Math.atan2(yb - ya, x - px)),
      );
    }
    kit.barrier({ w: x1 - x0, d: 0.4 }).at((x0 + x1) / 2, 0, z);
  };
  fence(FIELD.x0, FIELD.x1, FIELD.z0);
  fence(FIELD.x0, FIELD.x1, FIELD.z1);
  // The yard side, either side of the gate.
  kit.box({ w: 0.12, h: 1.3, d: 0.12 }).color(0x5e554a).at(GATE.x, 0, GATE.z - 1.6).collider();
  kit.box({ w: 0.12, h: 1.3, d: 0.12 }).color(0x5e554a).at(GATE.x, 0, GATE.z + 1.6).collider();
  kit.barrier({ w: 0.4, d: GATE.z - 1.6 - FIELD.z0 }).at(GATE.x, 0, (FIELD.z0 + GATE.z - 1.6) / 2);
  kit.barrier({ w: 0.4, d: FIELD.z1 - GATE.z - 1.6 }).at(GATE.x, 0, (FIELD.z1 + GATE.z + 1.6) / 2);
  // The gate leaf, swung back against the fence: five bars and a diagonal brace.
  kit
    .group((g) => {
      [0.15, 0.4, 0.65, 0.9, 1.1].forEach((y) => g.box({ w: 3, h: 0.07, d: 0.05 }).texture('wood_planks', { tile: 1 }).color(0x7a6a58).at(1.5, y, 0));
      g.box({ w: 0.07, h: 1.15, d: 0.05 }).color(0x6a5a48).at(0.04, 0.1, 0);
      g.box({ w: 3.2, h: 0.06, d: 0.05 }).color(0x6a5a48).at(1.5, 0.12, 0).object.rotation.set(0, 0, 0.34);
    })
    .at(GATE.x, 0, GATE.z - 1.5)
    .rotY(-100);
}

/** The forest edge: dense spruce from the end of the field, beech among them, and the track in. */
export function forestEdge(kit: LevelKit): void {
  const area = { x: (BOUNDS.x0 + FOREST_EDGE) / 2 - 2, z: -2, w: FOREST_EDGE - BOUNDS.x0 + 6, d: 56 };
  const clear = (x: number, z: number) =>
    x > FOREST_EDGE + 1 ||
    distanceToTrails([forestTrack], x, z) < 2.4 ||
    Math.hypot(x - SHAPE.x, z - SHAPE.z) < 1.4 ||
    Math.hypot(x - STUMP.x, z - STUMP.z) < 1.2;
  woodland(kit, { area, seed: 'yerly-edge', avoid: clear, spruce: 120, beech: 20, birch: 4 });
  undergrowth(kit, area, { seed: 'yerly-edge', count: 70, avoid: (x, z) => clear(x, z) && x > FOREST_EDGE - 1 });
  [
    [-63, -15, 0.5],
    [-65, 2, 0.7],
    [-70, -12, 0.45],
  ].forEach(([x, z, size], i) => rock(kit, x!, z!, size!, `yerly-rock-${i}`));
  kit.trees('bare', [
    { x: -40, z: -19.5, scale: 0.9 },
    { x: -28, z: 6.5, scale: 0.8, yaw: 120 },
  ]);
}
