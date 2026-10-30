import type { Point3 } from '../../engine/audio/audioManager';
import { cylinderGeometry } from '../../engine/render/geometry';
import { nowAndThen, sway, weather } from '../../game/ambient';
import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { wheel } from '../village_square/props';
import { tinKnock } from './sounds';

/**
 * Farm clutter for both farms: hand tools, a wheelbarrow, buckets, bales, a hay wagon, a harrow
 * and a plough, a kennel and its chain, and a loose sheet of iron. Each returns a group with its
 * origin on the ground and its front toward +Z; place it with `.at()` and `.rotY()`. Build the
 * still ones inside `kit.batch`.
 */

const RUST = 0x5e5248;
const HANDLE = 0x8a7a5c;
const IRON = 0x4a4844;
/** Galvanized iron gone dull, lighter than the rust on it. */
const GALVANIZED = 0x9a9890;

export type ToolKind = 'fork' | 'rake' | 'broom' | 'shovel' | 'dungFork';

/**
 * A long-handled tool leaning back against a wall behind it (-Z): the foot stands `lean` meters
 * out from the wall. Forks and rakes stand head up, the broom and the shovel head down.
 */
export function tool(kit: LevelKit, kind: ToolKind, lean = 0.35, handle = HANDLE) {
  const length = 1.45;
  return kit.group((outer) => {
    const g = outer.group((t) => {
      const headUp = kind === 'fork' || kind === 'rake' || kind === 'dungFork';
      t.box({ w: 0.035, h: length, d: 0.035 }).color(handle).at(0, headUp ? 0 : 0.3, 0);
      if (kind === 'fork' || kind === 'dungFork') {
        const tines = kind === 'fork' ? [-0.05, 0.05] : [-0.09, -0.03, 0.03, 0.09];
        t.box({ w: tines.length * 0.06 + 0.02, h: 0.03, d: 0.03 }).color(IRON).at(0, length, 0);
        tines.forEach((x) => t.box({ w: 0.012, h: 0.3, d: 0.012 }).color(IRON).at(x, length + 0.03, 0));
      }
      if (kind === 'rake') {
        t.box({ w: 0.46, h: 0.04, d: 0.04 }).color(0x6a5a40).at(0, length, 0);
        for (let i = 0; i < 9; i++) t.box({ w: 0.012, h: 0.07, d: 0.012 }).color(0x6a5a40).at(-0.2 + i * 0.05, length + 0.04, 0.02);
      }
      if (kind === 'broom') {
        t.box({ w: 0.16, h: 0.38, d: 0.1 }).color(0x6a5a3a).at(0, 0, 0);
        t.box({ w: 0.1, h: 0.05, d: 0.08 }).color(0x4a3e2c).at(0, 0.32, 0);
      }
      if (kind === 'shovel') {
        t.box({ w: 0.2, h: 0.28, d: 0.02 }).color(0x5e5e5a).at(0, 0.02, 0);
        t.box({ w: 0.14, h: 0.03, d: 0.03 }).color(handle).at(0, length + 0.3, 0);
      }
    });
    g.object.rotation.x = -Math.asin(Math.min(0.6, lean / length));
  });
}

/** A builder's wheelbarrow, its tray dented. `load` fills it with fresh earth. */
export function wheelbarrow(kit: LevelKit, load = false) {
  return kit.group((g) => {
    // An open tray: a floor and four sides, the front one sloping out over the wheel.
    const tray = (size: { w: number; h: number; d: number }) => g.box(size).texture('rust_metal', { tile: 0.8 }).color(0x7a847a);
    tray({ w: 0.5, h: 0.02, d: 0.6 }).at(0, 0.3, 0);
    [-1, 1].forEach((side) => tray({ w: 0.02, h: 0.26, d: 0.7 }).at(side * 0.29, 0.3, 0).object.rotation.z = side * -0.25);
    tray({ w: 0.62, h: 0.26, d: 0.02 }).at(0, 0.3, -0.33);
    tray({ w: 0.62, h: 0.3, d: 0.02 }).at(0, 0.3, 0.33).object.rotation.x = 0.6;
    if (load) g.box({ w: 0.54, h: 0.06, d: 0.7 }).texture('grave_dirt', { tile: 0.8 }).color(0x4a3c2e).at(0, 0.42, 0);
    wheel(g, 0.17, 0.07).at(0, 0.17, 0.55);
    [-1, 1].forEach((side) => {
      g.box({ w: 0.04, h: 0.04, d: 1.2 }).color(IRON).at(side * 0.22, 0.34, -0.05);
      g.box({ w: 0.035, h: 0.34, d: 0.035 }).color(IRON).at(side * 0.2, 0, -0.3);
      g.box({ w: 0.05, h: 0.05, d: 0.16 }).color(0x2a2826).at(side * 0.22, 0.36, -0.72);
    });
  });
}

/** A zinc bucket, the handle down. */
export function bucket(kit: LevelKit, color = 0x8a8c86) {
  return kit.group((g) => {
    g.cylinder({ r: 0.14, h: 0.3, sides: 7 }).color(color);
    g.cylinder({ r: 0.115, h: 0.01, sides: 7 }).color(0x2a2a26).at(0, 0.295, 0);
    g.box({ w: 0.29, h: 0.012, d: 0.012 }).color(IRON).at(0, 0.24, 0.05).object.rotation.x = -1.2;
  });
}

/** A round bale lying on its side, wrapped in plastic; the wrap of an old one goes grey and torn. */
export function roundBale(kit: LevelKit, wrap = 0xbcbcb2) {
  return kit.group((g) => {
    g.mesh(cylinderGeometry(0.65, 1.2, 10, 0.6).translate(0, -0.6, 0).rotateZ(Math.PI / 2)).texture('concrete_floor', { tile: 2.5 }).color(wrap).at(0, 0.62, 0).collider();
  });
}

/** Small square bales stacked two high, three along. */
export function squareBales(kit: LevelKit) {
  return kit.group((g) => {
    [
      [-0.95, 0, 0],
      [0, 0, 0.03],
      [0.95, 0, -0.02],
      [-0.48, 0.42, 0.02],
      [0.5, 0.42, -0.03],
    ].forEach(([x, y, z], i) => g.box({ w: 0.92, h: 0.42, d: 0.46 }).texture('grass_dead', { tile: 0.7 }).color(0xa2946a).at(x!, y!, z!).rotY((i % 3) * 2 - 2));
  });
}

/** A sheet of corrugated iron, as roofing or thrown over something. Origin at its middle. */
export function ironSheet(kit: LevelKit, w: number, d: number) {
  return kit.box({ w, h: 0.02, d }).texture('rust_metal', { tile: [0.12, 1] }).color(RUST);
}

/**
 * The old hay wagon with ladder sides, on wooden wheels. A `broken` one has lost its front left
 * wheel and sits on that axle in the grass.
 */
export function hayWagon(kit: LevelKit, broken = false) {
  return kit.group((outer) => {
    const body = outer.group((g) => {
      const wood = (size: { w: number; h: number; d: number }) => g.box(size).texture('wood_planks', { tile: 1.2 }).color(broken ? 0x5e5850 : 0x6e6050);
      wood({ w: 1.3, h: 0.07, d: 3.2 }).at(0, 0.74, 0);
      [-1, 1].forEach((side) => {
        [1.05, 1.45].forEach((y) => wood({ w: 0.05, h: 0.05, d: 3.1 }).at(side * 0.62, y, 0));
        [-1.4, -0.7, 0, 0.7, 1.4].forEach((z) => wood({ w: 0.05, h: 0.75, d: 0.05 }).at(side * 0.62, 0.78, z));
      });
      g.box({ w: 0.08, h: 0.08, d: 1.6 }).color(0x4e4438).at(0, 0.45, 2.3);
      [-1.1, 1.1].forEach((z) => g.box({ w: 1.5, h: 0.08, d: 0.08 }).color(0x3e3832).at(0, 0.38, z));
      [
        [-0.72, 1.1],
        [0.72, 1.1],
        [-0.72, -1.1],
        [0.72, -1.1],
      ]
        .filter(([x, z]) => !broken || x! > 0 || z! < 0)
        .forEach(([x, z]) => wheel(g, 0.38, 0.08, 0x4a4036).at(x!, 0.38, z!));
    });
    if (broken) {
      body.object.rotation.z = -0.2;
      body.object.rotation.x = 0.05;
      body.object.position.y = -0.12;
    }
  });
}

/** A spring-tine harrow lying flat, gone to rust, its tines in the grass. */
export function harrow(kit: LevelKit) {
  return kit.group((g) => {
    [-0.6, 0, 0.6].forEach((z) => g.box({ w: 2.2, h: 0.06, d: 0.06 }).texture('rust_metal', { tile: 0.5 }).color(RUST).at(0, 0.2, z));
    [-1, -0.35, 0.35, 1].forEach((x) => g.box({ w: 0.06, h: 0.05, d: 1.3 }).texture('rust_metal', { tile: 0.5 }).color(RUST).at(x, 0.22, 0));
    [-0.6, 0, 0.6].forEach((z, row) =>
      [-0.9, -0.5, -0.1, 0.3, 0.7].forEach((x) => {
        g.box({ w: 0.025, h: 0.26, d: 0.03 }).color(0x4a3e34).at(x + row * 0.12, -0.04, z + 0.06).object.rotation.x = 0.5;
      }),
    );
    // The drawbar, a triangle pointing at the tractor that hasn't come for it in years.
    [-1, 1].forEach((side) => g.box({ w: 0.05, h: 0.05, d: 1.1 }).color(RUST).at(side * 0.3, 0.16, 1.1).rotY(side * -16));
  });
}

/** A one-furrow plough, the kind once pulled by a horse, its mouldboard rusted brown. */
export function plough(kit: LevelKit) {
  return kit.group((g) => {
    const beam = g.box({ w: 0.1, h: 0.1, d: 2.1 }).texture('rust_metal', { tile: 0.6 }).color(RUST).at(0, 0.42, 0.2);
    beam.object.rotation.x = 0.12;
    const board = g.box({ w: 0.45, h: 0.36, d: 0.04 }).texture('rust_metal', { tile: 0.6 }).color(0x6a4a34).at(0.12, 0.02, -0.55).rotY(-35);
    board.object.rotation.z = 0.15;
    g.box({ w: 0.08, h: 0.42, d: 0.08 }).color(RUST).at(0, 0.02, -0.4);
    wheel(g, 0.2, 0.06, 0x3a3430).at(0, 0.2, 1.15);
    [-1, 1].forEach((side) => {
      const handle = g.box({ w: 0.04, h: 0.04, d: 1.1 }).color(0x5a4c3c).at(side * 0.22, 0.75, -1.0).rotY(side * 8);
      handle.object.rotation.x = -0.45;
    });
  });
}

/** A dog kennel of boards, its door in the gable end. */
export function kennel(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 0.8, h: 0.62, d: 0.95 }).texture('wood_planks', { tile: 0.8 }).color(0x6a5a48).collider();
    g.gable({ w: 1.1, d: 0.98, h: 0.32 }).texture('roof_shingles', { tile: 0.8 }).color(0x4a4642).at(0, 0.62, 0).rotY(90).doubleSided();
    g.box({ w: 0.36, h: 0.44, d: 0.02 }).color(0x0c0b0a).at(0, 0.02, 0.48);
  });
}

/** A chain lying on the ground from `from` to `to`, in the parent's coordinates, a link every 7 cm. */
export function chain(kit: LevelKit, from: { x: number; z: number }, to: { x: number; z: number }) {
  const length = Math.hypot(to.x - from.x, to.z - from.z);
  const yaw = (Math.atan2(to.x - from.x, to.z - from.z) * 180) / Math.PI;
  const links = Math.max(2, Math.round(length / 0.07));
  for (let i = 0; i <= links; i++) {
    const t = i / links;
    // A little slack: the chain lies in a shallow curve.
    const slack = Math.sin(t * Math.PI) * 0.08;
    kit
      .box({ w: i % 2 ? 0.012 : 0.03, h: i % 2 ? 0.03 : 0.012, d: 0.07 })
      .color(0x3a3834)
      .at(from.x + (to.x - from.x) * t + slack, 0.01, from.z + (to.z - from.z) * t)
      .rotY(yaw);
  }
}

/**
 * A sheet of corrugated iron hanging by one nail at `at`, swinging a little and knocking on the
 * boards behind it in the wind. `yaw` turns the wall it hangs on. Build it outside any batch.
 */
export function looseSheet(kit: LevelKit, ctx: SceneContext, at: Point3, yaw: number): Placed {
  const sky = weather(ctx.state);
  const sheet = kit
    .group((g) => g.box({ w: 0.8, h: 1.5, d: 0.02 }).texture('rust_metal', { tile: [0.12, 1] }).color(GALVANIZED).at(0.3, -1.45, 0.02))
    .at(at.x, at.y, at.z)
    .rotY(yaw)
    .dynamic();
  sheet.object.rotation.z = 0.12;
  sway(kit, sheet, { axis: 'z', degrees: 2 + sky.wind * 4, speed: 0.3 });
  nowAndThen(kit, ctx, 30 / (0.3 + sky.wind), () => {
    const p = ctx.player.position;
    if (Math.hypot(p.x - at.x, p.z - at.z) < 20) tinKnock(ctx.audio, { x: at.x, y: at.y - 1, z: at.z }, 0.3 + sky.wind * 0.3);
  }, 12);
  return sheet;
}
