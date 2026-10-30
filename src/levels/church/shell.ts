import { BufferGeometry, DoubleSide, Float32BufferAttribute, Mesh } from 'three';
import { createPs1Material } from '../../engine/render/ps1Material';
import type { LevelKit } from '../../game/kit/levelKit';
import { CHANCEL, MAIN_DOOR, NAVE, OFFICE, OFFICE_DOOR, RAISED, SACRISTY, SACRISTY_DOOR, SIDE_DOOR, WALL } from './layout';

/** The walls, floors, ceilings, and windows of the church, sacristy, and office. */

const WHITEWASH = 0xb8b6ae;
const DADO = 0x8e8c84;
const DADO_HEIGHT = 0.95;

/** An opening in a wall: `at` meters from the wall's start to its middle, `y` above the wall's foot. */
export interface Gap {
  at: number;
  w: number;
  h: number;
  y?: number;
}

/** A whitewashed wall with a stone dado, from one point to another, with doorways cut in it. */
export function wall(kit: LevelKit, from: [number, number], to: [number, number], h: number, gaps: Gap[] = []): void {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const yaw = (Math.atan2(-(z2 - z1), x2 - x1) * 180) / Math.PI;
  const point = (along: number) => [x1 + ((x2 - x1) * along) / length, z1 + ((z2 - z1) * along) / length] as const;
  const piece = (a: number, b: number, y0: number, y1: number) => {
    if (b - a < 0.01 || y1 - y0 < 0.01) return;
    const [x, z] = point((a + b) / 2);
    kit.box({ w: b - a, h: y1 - y0, d: WALL, cell: 1.5 }).texture('plaster_wall', { tile: 2.4 }).color(WHITEWASH).at(x, y0, z).rotY(yaw).collider();
    if (y0 > 0) return;
    kit.box({ w: b - a, h: DADO_HEIGHT, d: WALL + 0.06 }).texture('church_stone', { tile: 1.4 }).color(DADO).at(x, 0, z).rotY(yaw);
  };
  let start = 0;
  [...gaps]
    .sort((a, b) => a.at - b.at)
    .forEach((gap) => {
      const a = gap.at - gap.w / 2;
      const b = gap.at + gap.w / 2;
      piece(start, a, 0, h);
      piece(a, b, 0, gap.y ?? 0);
      piece(a, b, (gap.y ?? 0) + gap.h, h);
      start = b;
    });
  piece(start, length, 0, h);
}

/**
 * A window recessed in a wall that runs along Z. `inward` is +1 on a west wall and -1 on an east
 * wall. By day the leaded panes are pale grey and throw cold light in; at night they are nearly black.
 */
export function windowPane(kit: LevelKit, wallX: number, z: number, inward: 1 | -1, size: { w: number; h: number; y: number }, night: boolean): void {
  const face = wallX + inward * (WALL / 2 + 0.015);
  kit
    .box({ w: size.w, h: size.h, d: 0.02 })
    .texture('tiles_white', { tile: [0.36, 0.48] })
    .color(night ? 0x283244 : 0xb3bcc0)
    .unlit()
    .at(face, size.y, z)
    .rotY(90);
  // The stone reveal around the glass.
  const reveal = (w: number, h: number, dz: number, y: number) =>
    kit.box({ w: 0.16, h, d: w }).texture('church_stone', { tile: 0.8 }).color(0xa6a49c).at(face + inward * 0.07, y, z + dz);
  reveal(0.14, size.h + 0.14, -size.w / 2 - 0.07, size.y - 0.07);
  reveal(0.14, size.h + 0.14, size.w / 2 + 0.07, size.y - 0.07);
  reveal(size.w, 0.1, 0, size.y - 0.1);
  reveal(size.w, 0.12, 0, size.y + size.h);
  if (night) {
    kit.glow(Math.min(size.h, 2.4), 0x10141c).at(face + inward * 0.3, size.y + size.h / 2, z);
    return;
  }
  kit.glow(Math.min(size.h, 3), 0x3c4248).at(face + inward * 0.3, size.y + size.h / 2, z);
  kit.light({ color: 0x8e9aa6, intensity: size.h > 2 ? 1.3 : 0.7, range: size.h > 2 ? 7 : 4 }).at(face + inward * 1.6, size.y + size.h * 0.4, z);
  if (size.h > 2) lightShaft(kit, face, z, inward, size.y, size.y + size.h);
}

/**
 * A slanting band of dusty daylight from a window down to the floor. One flat additive quad,
 * facing along the wall so the nave sees it side on; brightest at the glass.
 */
function lightShaft(kit: LevelKit, face: number, z: number, inward: 1 | -1, bottom: number, top: number): void {
  const reach = 0.75;
  const corners = [
    [face, top],
    [face, bottom],
    [face + inward * reach * bottom, 0],
    [face + inward * reach * top, 0],
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(corners.flatMap(([x, y]) => [x!, y!, z]), 3));
  geometry.setAttribute('uv', new Float32BufferAttribute([0.18, 0.5, 0.82, 0.5, 0.82, 0.04, 0.18, 0.04], 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  kit.use((ctx) => {
    const material = createPs1Material({ glow: true, map: ctx.world.textures.get('glow'), color: 0x262a2e, side: DoubleSide });
    ctx.world.scene.add(new Mesh(geometry, material));
  });
}

export function buildShell(kit: LevelKit, night: boolean): void {
  const { x0, x1, z0, z1, h } = NAVE;

  // Nave.
  wall(kit, [x0, z1], [x0, z0], h);
  wall(kit, [x1, z1], [x1, z0], h);
  wall(kit, [x0, z1], [x1, z1], h, [{ at: MAIN_DOOR.x - x0, w: MAIN_DOOR.w, h: MAIN_DOOR.h }]);
  wall(kit, [x0, z0], [CHANCEL.x0, z0], h);
  wall(kit, [CHANCEL.x1, z0], [x1, z0], h);
  wall(kit, [CHANCEL.x0, z0], [CHANCEL.x1, z0], h, [{ at: (CHANCEL.x1 - CHANCEL.x0) / 2, w: CHANCEL.x1 - CHANCEL.x0, h: CHANCEL.h }]);
  kit.plane({ w: x1 - x0, d: z1 - z0, cell: 0.75 }).texture('church_floor', { tile: 1.6 }).color(0x9a958c).at(0, 0, 0);
  // The aisle, worn darker and smoother by two hundred years of feet.
  kit.plane({ w: 1.3, d: z1 - z0 - 1, cell: 0.75 }).texture('church_floor', { tile: 1.6 }).color(0x7a756e).at(0, 0.008, 0.5);
  kit.ceiling({ w: x1 - x0, d: z1 - z0, cell: 2 }).texture('plaster_wall', { tile: 3 }).color(0x8e8c86).at(0, h, 0);
  for (let z = z1 - 2.5; z > z0; z -= 3.6) {
    kit.box({ w: x1 - x0, h: 0.26, d: 0.3 }).texture('pew_wood', { tile: 1.5 }).color(0x5a4c40).at(0, h - 0.4, z);
  }
  [6.2, 0.8, -4.6].forEach((z) => windowPane(kit, x0, z, 1, { w: 1.1, h: 3.2, y: 2.9 }, night));
  [6.2, 0.8, -3.6].forEach((z) => windowPane(kit, x1, z, -1, { w: 1.1, h: 3.2, y: 2.9 }, night));

  // Chancel: one step up.
  const cw = CHANCEL.x1 - CHANCEL.x0;
  const cd = CHANCEL.z1 - CHANCEL.z0;
  const cz = (CHANCEL.z0 + CHANCEL.z1) / 2;
  wall(kit, [CHANCEL.x0, CHANCEL.z1], [CHANCEL.x0, CHANCEL.z0], CHANCEL.h);
  wall(kit, [CHANCEL.x1, CHANCEL.z1], [CHANCEL.x1, CHANCEL.z0], CHANCEL.h, [
    { at: CHANCEL.z1 - SIDE_DOOR.z, w: SIDE_DOOR.w, h: SIDE_DOOR.h, y: RAISED },
  ]);
  wall(kit, [CHANCEL.x0, CHANCEL.z0], [CHANCEL.x1, CHANCEL.z0], CHANCEL.h, [
    { at: SACRISTY_DOOR.x - CHANCEL.x0, w: SACRISTY_DOOR.w, h: SACRISTY_DOOR.h, y: RAISED },
  ]);
  kit.box({ w: cw, h: RAISED, d: cd, cell: 0.75 }).texture('church_floor', { tile: 1.4 }).color(0xa29c90).at(0, 0, cz).walkable('stone');
  kit.box({ w: cw, h: RAISED / 2, d: 0.4 }).texture('church_stone', { tile: 1 }).color(0x9a968c).at(0, 0, CHANCEL.z1 + 0.2).walkable('stone');
  kit.ceiling({ w: cw, d: cd, cell: 1.5 }).texture('plaster_wall', { tile: 3 }).color(0x8a8882).at(0, CHANCEL.h, cz);
  windowPane(kit, CHANCEL.x0, -14.2, 1, { w: 0.9, h: 2.6, y: 2.4 }, night);

  // Sacristy and parish office, behind the altar.
  room(kit, SACRISTY, [
    [[SACRISTY.x0, SACRISTY.z1], [SACRISTY.x0, SACRISTY.z0], []],
    [[SACRISTY.x0, SACRISTY.z0], [SACRISTY.x1, SACRISTY.z0], []],
    [[SACRISTY.x1, SACRISTY.z1], [SACRISTY.x1, SACRISTY.z0], [{ at: SACRISTY.z1 - OFFICE_DOOR.z, w: OFFICE_DOOR.w, h: OFFICE_DOOR.h, y: RAISED }]],
  ]);
  room(kit, OFFICE, [
    [[OFFICE.x0, OFFICE.z1], [OFFICE.x1, OFFICE.z1], []],
    [[OFFICE.x0, OFFICE.z0], [OFFICE.x1, OFFICE.z0], []],
    [[OFFICE.x1, OFFICE.z1], [OFFICE.x1, OFFICE.z0], []],
  ]);
  windowPane(kit, SACRISTY.x0, -19.6, 1, { w: 0.7, h: 1.1, y: RAISED + 1.4 }, night);
  windowPane(kit, OFFICE.x1, -18.3, -1, { w: 0.8, h: 1.1, y: RAISED + 1.2 }, night);
}

type Room = { x0: number; x1: number; z0: number; z1: number; h: number };

/** A small room on the raised floor: wooden boards, a low plaster ceiling, and the given walls. */
function room(kit: LevelKit, r: Room, walls: [[number, number], [number, number], Gap[]][]): void {
  const w = r.x1 - r.x0;
  const d = r.z1 - r.z0;
  const x = (r.x0 + r.x1) / 2;
  const z = (r.z0 + r.z1) / 2;
  walls.forEach(([from, to, gaps]) => wall(kit, from, to, RAISED + r.h, gaps));
  kit.plane({ w, d, cell: 0.6 }).texture('wood_floor', { tile: 1.6 }).color(0x8a8278).at(x, RAISED, z).walkable('wood');
  kit.ceiling({ w, d, cell: 1 }).texture('plaster_wall', { tile: 2 }).color(0x8c8a84).at(x, RAISED + r.h, z);
}
