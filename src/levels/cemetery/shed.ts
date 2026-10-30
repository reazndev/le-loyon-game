import type { LevelKit } from '../../game/kit/levelKit';
import { SHED, type Rect } from './layout';

const WALL = 0.3;
const HEIGHT = 2.3;
const DOOR_W = 0.95;
const STONE = 0x8e8a80;

/** Inside the shed, where Raymond's torch never finds the reporter. */
export const SHED_INSIDE: Rect = { x: SHED.x, z: SHED.z, w: SHED.w - 2 * WALL - 0.1, d: SHED.d - 2 * WALL - 0.1 };
/** Where the folded tarp lies until the reporter drags it out. */
export const TARP_IN_SHED = { x: SHED.x - 0.95, z: SHED.z + 0.75 };

/**
 * The ossuary from the 1700s, now the gravedigger's shed: a door that doesn't lock, a barred
 * window onto the graves, tools, a wheelbarrow, a stack of new wooden crosses, and in the dark
 * corner behind them a broken enamel photo frame (cem2_ossuary_shape). The tarp is the dig site's.
 */
export function ossuary(kit: LevelKit): void {
  const x0 = SHED.x - SHED.w / 2;
  const x1 = SHED.x + SHED.w / 2;
  const z0 = SHED.z - SHED.d / 2;
  const z1 = SHED.z + SHED.d / 2;
  const wall = (w: number, d: number, x: number, z: number, y = 0, h = HEIGHT) =>
    kit.box({ w, h, d, cell: 0.6 }).texture('stone_wall', { tile: 1.3 }).color(STONE).at(x, y, z).collider();

  wall(WALL, SHED.d, x0 + WALL / 2, SHED.z);
  wall(SHED.w, WALL, SHED.x, z1 - WALL / 2);
  // The north wall has the barred window, looking out over the graves.
  const window = { x: SHED.x - 0.3, w: 0.55, y: 1.15, h: 0.45 };
  const leftW = window.x - window.w / 2 - x0;
  const rightW = x1 - (window.x + window.w / 2);
  wall(leftW, WALL, x0 + leftW / 2, z0 + WALL / 2);
  wall(rightW, WALL, x1 - rightW / 2, z0 + WALL / 2);
  kit.box({ w: window.w, h: window.y, d: WALL }).texture('stone_wall', { tile: 1.3 }).color(STONE).at(window.x, 0, z0 + WALL / 2).collider();
  kit.box({ w: window.w, h: HEIGHT - window.y - window.h, d: WALL }).texture('stone_wall', { tile: 1.3 }).color(STONE).at(window.x, window.y + window.h, z0 + WALL / 2);
  [-0.17, 0, 0.17].forEach((dx) => kit.box({ w: 0.025, h: window.h, d: 0.025 }).texture('rust_metal').color(0x3a3430).at(window.x + dx, window.y, z0 + 0.05));
  // The east wall, with the doorway onto the central path.
  const sideD = (SHED.d - DOOR_W) / 2;
  wall(WALL, sideD, x1 - WALL / 2, z0 + sideD / 2);
  wall(WALL, sideD, x1 - WALL / 2, z1 - sideD / 2);
  kit.box({ w: WALL, h: HEIGHT - 2.05, d: DOOR_W }).texture('stone_wall', { tile: 1.3 }).color(STONE).at(x1 - WALL / 2, 2.05, SHED.z);
  kit
    .group((g) => g.box({ w: 0.06, h: 2.0, d: DOOR_W - 0.05 }).texture('door_wood', { tile: [DOOR_W, 2] }).color(0x7a6e60).at(0, 0, -(DOOR_W - 0.05) / 2))
    .at(x1 + 0.02, 0.02, z1 - sideD)
    .rotY(-70);

  kit.gable({ w: SHED.w + 0.5, d: SHED.d + 0.5, h: 1.0 }).texture('roof_tiles', { tile: 1.5 }).color(0x6e6560).at(SHED.x, HEIGHT, SHED.z).doubleSided();
  kit.ceiling({ w: SHED.w, d: SHED.d }).texture('wood_planks', { tile: 1.2 }).color(0x4a443e).at(SHED.x, HEIGHT, SHED.z);
  kit.plane({ w: SHED.w - 2 * WALL, d: SHED.d - 2 * WALL, cell: 0.5 }).texture('mud', { tile: 1.2 }).color(0x5e5850).at(SHED.x, 0.025, SHED.z).walkable('stone');

  // New wooden crosses for new graves, leaning against the west wall.
  [0, 1, 2, 3, 4].forEach((i) =>
    kit
      .group((g) => {
        g.box({ w: 0.06, h: 1.15, d: 0.035 }).texture('wood_planks', { tile: 0.6 }).color(0x9a8a74);
        g.box({ w: 0.48, h: 0.06, d: 0.035 }).texture('wood_planks', { tile: 0.6 }).color(0x9a8a74).at(0, 0.82, 0);
      })
      .at(x0 + WALL + 0.12 + i * 0.03, 0, SHED.z - 0.75 + i * 0.07)
      .rotY(90 + i * 4),
  );
  // Behind the crosses, at head height: something pale. The broken enamel frame of a grave photo.
  kit.box({ w: 0.5, h: 0.035, d: 0.24 }).texture('wood_planks', { tile: 0.5 }).color(0x4e463e).at(x0 + WALL + 0.12, 1.5, SHED.z - 0.75);
  kit.box({ w: 0.035, h: 0.2, d: 0.15 }).color(0xd8d4ca).at(x0 + WALL + 0.06, 1.535, SHED.z - 0.72);

  // Tools on the north wall and the wheelbarrow along the south wall.
  [
    [0.25, 1.5, 0x6a5e50],
    [0.45, 1.6, 0x5e5448],
    [0.62, 1.4, 0x6a5e50],
  ].forEach(([dx, h, color]) => kit.box({ w: 0.035, h: h!, d: 0.035 }).color(color!).at(x1 - WALL - dx!, 0, z0 + WALL + 0.1));
  kit.box({ w: 0.22, h: 0.03, d: 0.3 }).texture('rust_metal').color(0x504a44).at(x1 - WALL - 0.25, 0, z0 + WALL + 0.18);
  kit.group((g) => {
    g.box({ w: 0.6, h: 0.28, d: 0.9 }).texture('rust_metal', { tile: 0.8 }).color(0x4e5650).at(0, 0.28, 0);
    g.cylinder({ r: 0.17, h: 0.06, sides: 7 }).color(0x262422).at(0, 0, -0.55);
    g.box({ w: 0.04, h: 0.04, d: 0.7 }).color(0x5a4e40).at(-0.22, 0.35, 0.6);
    g.box({ w: 0.04, h: 0.04, d: 0.7 }).color(0x5a4e40).at(0.22, 0.35, 0.6);
  })
    .at(SHED.x + 0.55, 0, z1 - WALL - 0.45)
    .rotY(90);
}
