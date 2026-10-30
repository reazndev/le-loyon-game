import type { LevelKit } from '../../game/kit/levelKit';
import type { Placed } from '../../game/kit/builders';

/** Café furniture built from boxes: tables with checked cloths, chairs, and what sits on them. */

const WOOD = 0x6a4e36;
const DARK_WOOD = 0x4a3626;

/** A chair at (x, z) facing `yaw`. Upside down on the table it stands by when `up`. */
export function chair(kit: LevelKit, x: number, z: number, yaw: number, up = false): Placed {
  return kit
    .group((g) => {
      if (up) {
        // Seat on the tabletop, legs in the air.
        g.box({ w: 0.42, h: 0.04, d: 0.42 }).texture('wood_planks', { tile: 0.5 }).color(WOOD).at(0, 0.78, 0);
        [-0.18, 0.18].forEach((lx) => [-0.18, 0.18].forEach((lz) => g.box({ w: 0.04, h: 0.44, d: 0.04 }).color(DARK_WOOD).at(lx, 0.82, lz)));
        g.box({ w: 0.42, h: 0.42, d: 0.04 }).texture('wood_planks', { tile: 0.5 }).color(WOOD).at(0, 0.36, 0.2);
        return;
      }
      g.box({ w: 0.42, h: 0.04, d: 0.42 }).texture('wood_planks', { tile: 0.5 }).color(WOOD).at(0, 0.44, 0);
      [-0.18, 0.18].forEach((lx) => [-0.18, 0.18].forEach((lz) => g.box({ w: 0.04, h: 0.44, d: 0.04 }).color(DARK_WOOD).at(lx, 0, lz)));
      g.box({ w: 0.42, h: 0.46, d: 0.04 }).texture('wood_planks', { tile: 0.5 }).color(WOOD).at(0, 0.48, 0.2);
      // A heart cut in the back, as on every chair in every Stübli.
      g.box({ w: 0.08, h: 0.08, d: 0.05 }).color(0x1c1610).at(0, 0.74, 0.2);
    })
    .at(x, 0, z)
    .rotY(yaw);
}

export interface TableOptions {
  /** Chairs upside down on the top, for the night. */
  chairsUp?: boolean;
  /** Which sides have a chair, as yaws they face: 0 is a chair south of the table facing north. */
  chairs?: number[];
}

/** A square table with a red checked cloth, a candle bottle, and its chairs. */
export function cafeTable(kit: LevelKit, x: number, z: number, options: TableOptions = {}): void {
  const { chairsUp = false, chairs = [0, 90, 180, -90] } = options;
  kit.box({ w: 0.8, h: 0.04, d: 0.8 }).texture('wood_planks', { tile: 0.6 }).color(WOOD).at(x, 0.72, z).collider();
  [-0.34, 0.34].forEach((lx) => [-0.34, 0.34].forEach((lz) => kit.box({ w: 0.05, h: 0.72, d: 0.05 }).color(DARK_WOOD).at(x + lx, 0, z + lz)));
  if (!chairsUp) {
    // The cloth hangs a little over the edge, red and white checks.
    kit.box({ w: 0.86, h: 0.012, d: 0.86 }).texture('tiles_white', { tile: 0.24 }).color(0xb06058).at(x, 0.76, z);
    kit.box({ w: 0.06, h: 0.14, d: 0.06 }).color(0x2c3a24).at(x + 0.12, 0.772, z - 0.1);
  }
  // At night two chairs go up on each table, their backs hanging over opposite edges.
  (chairsUp ? [0, 180] : chairs).forEach((yaw) => {
    const rad = (yaw * Math.PI) / 180;
    const reach = chairsUp ? 0.2 : 0.55;
    chair(kit, x + Math.sin(rad) * reach, z + Math.cos(rad) * reach, yaw, chairsUp);
  });
}

/** A plate with something on it, a glass, and cutlery on a table at (x, z) whose top is at `top`. */
export function placeSetting(kit: LevelKit, x: number, z: number, dish: 'soup' | 'rosti' | 'coffee' | 'wine', top = 0.772): void {
  if (dish === 'coffee') {
    kit.cylinder({ r: 0.07, h: 0.01, sides: 8 }).color(0xd8d2c4).at(x, top, z);
    kit.cylinder({ r: 0.04, h: 0.06, sides: 8 }).color(0xe0dad0).at(x, top + 0.01, z);
    kit.cylinder({ r: 0.033, h: 0.005, sides: 8 }).color(0x2a1a10).unlit().at(x, top + 0.066, z);
    return;
  }
  if (dish === 'wine') {
    kit.cylinder({ r: 0.03, h: 0.1, sides: 6 }).color(0xc8ccc0).at(x, top, z);
    kit.cylinder({ r: 0.026, h: 0.05, sides: 6 }).color(0xd8d090).at(x, top + 0.01, z);
    return;
  }
  kit.cylinder({ r: 0.14, h: 0.015, sides: 10 }).color(0xe2dcd0).at(x, top, z);
  if (dish === 'soup') {
    kit.cylinder({ r: 0.1, h: 0.05, sides: 10 }).color(0xe8e2d6).at(x, top + 0.015, z);
    kit.cylinder({ r: 0.085, h: 0.005, sides: 10 }).color(0xc8a868).at(x, top + 0.06, z);
  } else {
    kit.cylinder({ r: 0.1, h: 0.025, sides: 10 }).color(0xb8843c).at(x, top + 0.015, z);
    kit.cylinder({ r: 0.04, h: 0.006, sides: 8 }).color(0xf0e8c8).at(x - 0.02, top + 0.04, z + 0.01);
  }
  kit.box({ w: 0.015, h: 0.006, d: 0.17 }).color(0x9a9a96).at(x - 0.19, top, z);
  kit.box({ w: 0.015, h: 0.006, d: 0.17 }).color(0x9a9a96).at(x + 0.19, top, z);
  // A basket of bread.
  kit.box({ w: 0.18, h: 0.05, d: 0.12 }).texture('wood_planks', { tile: 0.3 }).color(0x8a6a3a).at(x + 0.08, top, z - 0.26);
  kit.box({ w: 0.14, h: 0.05, d: 0.08 }).color(0xb08850).at(x + 0.08, top + 0.03, z - 0.26);
}

/** A row of bottles and glasses on a shelf, from `x0` along +X. */
export function bottles(kit: LevelKit, x0: number, y: number, z: number, count: number, yaw = 0): void {
  const colors = [0x2c4a2c, 0x6a3a1c, 0xc8c8b0, 0x3a2a1a, 0x7a6a2a];
  kit
    .group((g) => {
      for (let i = 0; i < count; i++) {
        const tall = i % 3 === 0;
        g.cylinder({ r: 0.035, h: tall ? 0.3 : 0.22, sides: 6 })
          .color(colors[i % colors.length]!)
          .at(i * 0.11, 0, 0);
      }
    })
    .at(x0, y, z)
    .rotY(yaw);
}
