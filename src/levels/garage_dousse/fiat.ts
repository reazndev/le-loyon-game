import type { LevelKit } from '../../game/kit/levelKit';
import { LIFT, SUMP } from './layout';

/**
 * A Fiat 127 up on a two-post lift, nose toward the bench, wheels hanging. Low poly: a body,
 * a glasshouse, pillars, bumpers, lamps, and four wheels. The posts collide; the car doesn't,
 * so the player can walk underneath.
 */

const PAINT = 0x9a7e48;
const TRIM = 0x34342f;
const LIFT_PAINT = 0x445260;

export function buildFiatOnLift(kit: LevelKit): void {
  kit.group((g) => lift(g)).at(LIFT.x, 0, LIFT.z);
  kit.group((g) => fiat(g)).at(LIFT.x, LIFT.rise, LIFT.z);
  // The drip tray under the sump.
  kit.box({ w: 0.6, h: 0.06, d: 0.45 }).texture('rust_metal', { tile: 0.6 }).color(0x3a3834).at(SUMP.x, 0, SUMP.z);
  kit.plane({ w: 0.5, d: 0.35 }).color(0x0e0e0c).at(SUMP.x, 0.065, SUMP.z);
}

function lift(g: LevelKit): void {
  [-1, 1].forEach((side) => {
    const x = side * LIFT.posts;
    g.box({ w: 0.3, h: 3.2, d: 0.3 }).texture('rust_metal', { tile: 1.4 }).color(LIFT_PAINT).at(x, 0, 0).collider();
    g.box({ w: 0.6, h: 0.04, d: 0.6 }).texture('rust_metal', { tile: 0.6 }).color(0x3a3c3c).at(x, 0, 0);
    g.box({ w: 0.36, h: 0.3, d: 0.36 }).texture('rust_metal', { tile: 0.6 }).color(0x3c4650).at(x, LIFT.rise - 0.26, 0);
    // Two arms from each carriage to the pads under the sills.
    [-1, 1].forEach((end) =>
      g
        .box({ w: 0.95, h: 0.07, d: 0.1 })
        .texture('rust_metal', { tile: 0.6 })
        .color(0x3a3a38)
        .at(x - side * 0.42, LIFT.rise - 0.1, end * 0.42)
        .rotY(side * end * -40),
    );
  });
  g.box({ w: LIFT.posts * 2 + 0.3, h: 0.16, d: 0.2 }).texture('rust_metal', { tile: 1.4 }).color(LIFT_PAINT).at(0, 3.2, 0);
  // The hydraulic hose down the left post.
  g.box({ w: 0.03, h: 2.9, d: 0.03 }).color(0x161616).at(-LIFT.posts + 0.17, 0.1, 0.1);
}

function fiat(g: LevelKit): void {
  const body = (w: number, h: number, d: number, x: number, y: number, z: number) =>
    g.box({ w, h, d, cell: 0.5 }).texture('rust_metal', { tile: 2.4 }).color(PAINT).at(x, y, z);

  // Sills, body, and a short bonnet that drops toward the nose (-Z).
  g.box({ w: 1.46, h: 0.08, d: 3.4 }).color(0x22201c).at(0, 0, 0);
  body(1.52, 0.5, 3.0, 0, 0.08, 0.3);
  body(1.52, 0.42, 0.6, 0, 0.08, -1.5);
  // The glasshouse: a dark band, a roof, and the pillars that hold it.
  g.box({ w: 1.38, h: 0.36, d: 1.9 }).color(0x1a1e20).at(0, 0.58, 0.45);
  body(1.32, 0.06, 1.7, 0, 0.94, 0.5);
  [-0.48, 0.25, 1.38].forEach((z) => [-1, 1].forEach((side) => body(0.04, 0.36, 0.08, side * 0.68, 0.58, z)));
  body(1.4, 0.36, 0.06, 0, 0.58, 1.38);

  // Bumpers, lamps, grille, plate.
  g.box({ w: 1.58, h: 0.12, d: 0.1 }).color(TRIM).at(0, 0.14, -1.84);
  g.box({ w: 1.58, h: 0.12, d: 0.1 }).color(TRIM).at(0, 0.14, 1.84);
  g.box({ w: 0.62, h: 0.12, d: 0.03 }).color(0x1c1c1a).at(0, 0.3, -1.81);
  [-1, 1].forEach((side) => {
    g.box({ w: 0.24, h: 0.14, d: 0.03 }).color(0x8e8c80).at(side * 0.5, 0.28, -1.81);
    g.box({ w: 0.2, h: 0.12, d: 0.03 }).color(0x5a2622).at(side * 0.56, 0.32, 1.81);
  });
  g.box({ w: 0.4, h: 0.1, d: 0.02 }).color(0xa8a69c).at(0, 0.32, 1.82);

  // Underneath: the sump, the gearbox, and the exhaust back to the tail.
  g.box({ w: 0.42, h: 0.14, d: 0.32 }).texture('rust_metal', { tile: 0.5 }).color(0x2a2824).at(0, -0.12, -1.1);
  g.box({ w: 0.3, h: 0.14, d: 0.4 }).texture('rust_metal', { tile: 0.5 }).color(0x302e2a).at(0.25, -0.1, -0.7);
  g.box({ w: 0.06, h: 0.06, d: 2.6 }).texture('rust_metal', { tile: 0.5 }).color(0x4a3a2c).at(0.35, -0.06, 0.4);

  // Wheels hang a little below the sills with the weight off them.
  [-1.18, 1.12].forEach((z) =>
    [-1, 1].forEach((side) => {
      const wheel = g.cylinder({ r: 0.27, h: 0.16, sides: 10 }).color(0x1a1a1a).at(side * 0.6, 0.06, z);
      wheel.mesh.rotation.z = (-side * Math.PI) / 2;
      const hub = g.cylinder({ r: 0.12, h: 0.17, sides: 8 }).color(0x5a5a56).at(side * 0.6, 0.06, z);
      hub.mesh.rotation.z = (-side * Math.PI) / 2;
    }),
  );
}
