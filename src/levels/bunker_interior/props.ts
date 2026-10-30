import { CylinderGeometry } from 'three';
import { hashString, seededRandom } from '../../engine/random';
import type { LevelKit } from '../../game/kit/levelKit';
import { handText, scrawl } from '../forest_path/scrawl';

/** Furniture and litter for the fort. Each prop stands on y = 0 at its position unless noted. */

const STEEL = 0x5a5c56;
const OLIVE = 0x5c6244;

/** A stack of three army bunks, head to the wall along `yaw`. The canvas has rotted out of most frames. */
export function bunkStack(kit: LevelKit, x: number, z: number, yaw: number, seed: string): void {
  const random = seededRandom(hashString(seed));
  kit.group((g) => {
    [-0.38, 0.38].forEach((px) =>
      [-0.92, 0.92].forEach((pz) => g.box({ w: 0.05, h: 2.05, d: 0.05 }).texture('rust_metal', { tile: 0.5 }).color(STEEL).at(px, 0, pz)),
    );
    [0.3, 1.0, 1.7].forEach((y) => {
      g.box({ w: 0.8, h: 0.04, d: 0.04 }).texture('rust_metal', { tile: 0.5 }).color(STEEL).at(0, y, -0.92);
      g.box({ w: 0.8, h: 0.04, d: 0.04 }).texture('rust_metal', { tile: 0.5 }).color(STEEL).at(0, y, 0.92);
      g.box({ w: 0.04, h: 0.04, d: 1.84 }).texture('rust_metal', { tile: 0.5 }).color(STEEL).at(-0.38, y, 0);
      g.box({ w: 0.04, h: 0.04, d: 1.84 }).texture('rust_metal', { tile: 0.5 }).color(STEEL).at(0.38, y, 0);
      if (random() < 0.35) {
        // What is left of the canvas sags between the rails.
        g.box({ w: 0.72, h: 0.02, d: 0.6 + random() * 0.9 }).texture('camo_cape', { tile: 1 }).color(0x6a6450).at(0, y - 0.03, (random() - 0.5) * 0.5);
      }
    });
    g.barrier({ w: 0.85, d: 1.9 });
  })
    .at(x, 0, z)
    .rotY(yaw);
}

export function table(kit: LevelKit, x: number, z: number, yaw: number, w = 1.8, d = 0.8): void {
  kit.group((g) => {
    g.box({ w, h: 0.05, d }).texture('wood_planks', { tile: 1 }).color(0x6e6050).at(0, 0.72, 0);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => g.box({ w: 0.06, h: 0.72, d: 0.06 }).texture('wood_planks').color(0x5a4e42).at((sx * (w - 0.12)) / 2, 0, (sz * (d - 0.12)) / 2)));
    g.barrier({ w, d });
  })
    .at(x, 0, z)
    .rotY(yaw);
}

export function bench(kit: LevelKit, x: number, z: number, yaw: number, w = 1.6): void {
  kit.group((g) => {
    g.box({ w, h: 0.05, d: 0.3 }).texture('wood_planks', { tile: 1 }).color(0x665a4c).at(0, 0.42, 0);
    [-1, 1].forEach((s) => g.box({ w: 0.05, h: 0.42, d: 0.26 }).texture('wood_planks').color(0x54493e).at((s * (w - 0.15)) / 2, 0, 0));
  })
    .at(x, 0, z)
    .rotY(yaw);
}

export function chair(kit: LevelKit, x: number, z: number, yaw: number, fallen = false): void {
  const chairGroup = kit
    .group((g) => {
      g.box({ w: 0.42, h: 0.04, d: 0.42 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5c4c).at(0, 0.45, 0);
      g.box({ w: 0.42, h: 0.45, d: 0.04 }).texture('wood_planks', { tile: 0.6 }).color(0x625446).at(0, 0.49, -0.19);
      [-0.18, 0.18].forEach((sx) => [-0.18, 0.18].forEach((sz) => g.box({ w: 0.04, h: 0.45, d: 0.04 }).color(0x4e4438).at(sx, 0, sz)));
    })
    .at(x, fallen ? 0.21 : 0, z)
    .rotY(yaw);
  if (fallen) chairGroup.object.rotation.x = -Math.PI / 2;
}

/** A steel locker or cupboard, olive green. Origin at the bottom center of its front face's footprint. */
export function locker(kit: LevelKit, x: number, z: number, yaw: number, size = { w: 0.6, h: 1.8, d: 0.5 }) {
  return kit.box(size).texture('rust_metal', { tile: 0.8 }).color(OLIVE).at(x, 0, z).rotY(yaw);
}

/** Beer cans from teenagers: some standing, most on their side, a few crushed. */
export function beerCans(kit: LevelKit, area: { x: number; z: number; w: number; d: number }, count: number, seed: string): void {
  const random = seededRandom(hashString(seed));
  const colors = [0x8a2a22, 0xa8a8a0, 0x2c5a34, 0xb08a2a, 0x2a3a6a];
  Array.from({ length: count }, () => {
    const x = area.x + (random() - 0.5) * area.w;
    const z = area.z + (random() - 0.5) * area.d;
    const lying = random() < 0.7;
    const can = kit
      .mesh(new CylinderGeometry(0.033, 0.033, lying ? 0.09 + random() * 0.03 : 0.12, 6).translate(0, 0.06, 0))
      .color(colors[Math.floor(random() * colors.length)]!)
      .at(x, lying ? 0.033 : 0, z)
      .rotY(random() * 360);
    if (lying) can.object.rotation.z = Math.PI / 2;
  });
}

/** Candle stubs and cigarette butts left on a surface at height `y`. */
export function stubs(kit: LevelKit, area: { x: number; z: number; w: number; d: number }, y: number, count: number, seed: string): void {
  const random = seededRandom(hashString(seed));
  Array.from({ length: count }, (_, i) => {
    const x = area.x + (random() - 0.5) * area.w;
    const z = area.z + (random() - 0.5) * area.d;
    if (i % 3 === 0) kit.cylinder({ r: 0.018, h: 0.03 + random() * 0.04, sides: 5 }).color(0xcac2a8).at(x, y, z);
    else kit.box({ w: 0.03, h: 0.009, d: 0.009 }).color(0xc8b890).at(x, y, z).rotY(random() * 360);
  });
}

/** Stenciled army lettering, German over French. Faces +Z; turn it with `rotY`. */
export function stencil(kit: LevelKit, lines: string[], width = 1.1) {
  const pixels = Math.max(96, Math.ceil(Math.max(...lines.map((line) => line.length)) * 7.6) + 4);
  return scrawl(kit, { w: width, h: 0.22 * lines.length }, [pixels, 18 * lines.length], (g) =>
    lines.forEach((line, i) => handText(g, line, 2, 9 + i * 18, { size: 12, color: '#24261f', font: 'bold monospace' })),
  );
}

/** Teenage graffiti in marker and spray. Faces +Z. */
export function graffiti(kit: LevelKit, lines: { text: string; color: string; size: number; angle?: number }[], size = { w: 1.4, h: 0.9 }) {
  return scrawl(kit, size, [112, 72], (g) =>
    lines.forEach((line, i) => handText(g, line.text, 4 + (i % 2) * 18, 12 + i * (60 / Math.max(1, lines.length)), { size: line.size, color: line.color, angle: line.angle ?? 0 })),
  );
}

/** Pipes and a cable tray along a corridor ceiling, from z0 to z1 at x. */
export function ceilingRuns(kit: LevelKit, x: number, z0: number, z1: number, y: number): void {
  const length = Math.abs(z1 - z0);
  const mid = (z0 + z1) / 2;
  kit.mesh(new CylinderGeometry(0.05, 0.05, length, 6).rotateX(Math.PI / 2)).texture('rust_metal', { tile: 0.6 }).color(0x5e5a52).at(x, y - 0.12, mid);
  kit.mesh(new CylinderGeometry(0.03, 0.03, length, 5).rotateX(Math.PI / 2)).texture('rust_metal', { tile: 0.6 }).color(0x4e5048).at(x + 0.14, y - 0.09, mid);
  kit.box({ w: 0.26, h: 0.03, d: length }).texture('rust_metal', { tile: 0.8 }).color(0x4a4a44).at(x - 0.3, y - 0.14, mid);
  // Brackets every two meters.
  Array.from({ length: Math.floor(length / 2) }, (_, i) => Math.min(z0, z1) + 1 + i * 2).forEach((z) =>
    kit.box({ w: 0.5, h: 0.12, d: 0.04 }).color(0x3e3e3a).at(x - 0.1, y - 0.12, z),
  );
}

/** Two wires taped along a wall at height `y`, as a run of points. */
export function wires(kit: LevelKit, points: [number, number][], y: number): void {
  points.slice(1).forEach(([bx, bz], i) => {
    const [ax, az] = points[i]!;
    const length = Math.hypot(bx - ax, bz - az);
    const yaw = (Math.atan2(-(bz - az), bx - ax) * 180) / Math.PI;
    [0, 0.025].forEach((dy) => kit.box({ w: length, h: 0.012, d: 0.012 }).color(dy ? 0x6a1a14 : 0x141414).at((ax + bx) / 2, y + dy, (az + bz) / 2).rotY(yaw));
    // Strips of tape holding them up.
    Array.from({ length: Math.floor(length / 0.9) }, (_, j) => (j + 0.5) / Math.floor(length / 0.9)).forEach((t) =>
      kit.box({ w: 0.05, h: 0.06, d: 0.016 }).color(0x8a8670).at(ax + (bx - ax) * t, y - 0.01, az + (bz - az) * t).rotY(yaw),
    );
  });
}
