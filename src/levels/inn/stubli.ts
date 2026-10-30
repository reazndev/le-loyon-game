import type { LightBuilder, MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { fogWindow } from '../../game/kit/windows';
import { darkOutside, type InnDressing } from './dressing';
import { chair } from './furniture';
import { floorAndCeiling, pendantLamp, wall, type Finish } from './interior';
import { DESK, PHONE, SCREEN, STUBLI, STUBLI_DOOR } from './layout';

/**
 * The stübli, the small back room: Yannick's computer on a desk against the west wall, the beige
 * phone on the north wall, folders on a shelf, a corner bench and table, a window onto the square.
 */

const WOOD_PANELS: Finish = {
  texture: 'plaster_wall',
  tile: 1.6,
  color: 0xb0a48a,
  dado: { texture: 'wood_planks', color: 0x9a7656, h: 1.25, tile: 1 },
};
const CASE = 0xc8bc9a;

export interface StubliProps {
  /** The computer's interaction: sit down at it. */
  useComputer: () => void;
}

/** Yannick's monitor and the light it throws, for the night it dials out by itself. */
export interface Monitor {
  screen: MeshBuilder;
  light: LightBuilder;
}

export function buildStubli(kit: LevelKit, dressing: InnDressing, props: StubliProps): Monitor {
  const { x0, x1, z0, z1, h } = STUBLI;
  const night = darkOutside(dressing);
  wall(kit, [x0, z0], [x1, z0], h, WOOD_PANELS);
  // The stübli's own face on the wall it shares with the café.
  wall(kit, [x1 - 0.1, z1], [x1 - 0.1, z0], h, WOOD_PANELS, [{ at: z1 - STUBLI_DOOR.z, w: STUBLI_DOOR.w, h: STUBLI_DOOR.h }]);
  wall(kit, [x0, z1], [x1, z1], h, WOOD_PANELS, [{ at: 2.0, w: 1.0, h: 1.0, y: 1.0 }]);
  wall(kit, [x0, z1], [x0, z0], h, WOOD_PANELS);
  floorAndCeiling(kit, STUBLI, { texture: 'wood_floor', tile: 1.2, color: 0x7a6a58 }, { texture: 'wood_planks', tile: 1.4, color: 0x5a4434 });
  fogWindow(kit, { x: x0 + 2.0, z: z1, facing: 0, w: 1.0, h: 1.0, y: 1.0, night, lamp: true });

  // The corner bench and the regulars' table, with the brass Stammtisch sign and an ashtray.
  kit.box({ w: 3.0, h: 0.45, d: 0.45 }).texture('wood_planks', { tile: 0.8 }).color(0x5a4232).at(x0 + 1.75, 0, z0 + 0.3).collider();
  kit.box({ w: 3.0, h: 0.5, d: 0.06 }).texture('wood_planks', { tile: 0.8 }).color(0x5a4232).at(x0 + 1.75, 0.45, z0 + 0.12);
  kit.box({ w: 0.9, h: 0.04, d: 0.9 }).texture('wood_planks', { tile: 0.7 }).color(0x6a4e36).at(x0 + 2.2, 0.72, z0 + 1.2).collider();
  kit.cylinder({ r: 0.07, h: 0.72, sides: 6 }).color(0x3a2a20).at(x0 + 2.2, 0, z0 + 1.2);
  kit.cylinder({ r: 0.08, h: 0.03, sides: 8 }).color(0x8a8070).at(x0 + 2.0, 0.76, z0 + 1.3);
  kit.box({ w: 0.2, h: 0.05, d: 0.02 }).color(0xb89a50).at(x0 + 2.2, 0.76, z0 + 1.0);
  chair(kit, x0 + 2.2, z0 + 1.85, 0);

  // Shelf of folders: the bookings, the commune's notices, the tax papers.
  kit.box({ w: 1.1, h: 0.03, d: 0.25 }).color(0x5a4434).at(x0 + 0.8, 1.55, z0 + 0.15);
  [0x6a2a24, 0x2a3a5a, 0x5a5a3a, 0x6a2a24, 0x3a4a3a, 0x8a7a5a, 0x2a3a5a].forEach((color, i) =>
    kit.box({ w: 0.08, h: 0.3, d: 0.22 }).color(color).at(x0 + 0.35 + i * 0.12, 1.58, z0 + 0.15),
  );

  // The phone on its wall plate.
  kit.box({ w: 0.18, h: 0.26, d: 0.06 }).color(0xc8bca0).at(PHONE.x, PHONE.y - 0.13, PHONE.z);
  kit.box({ w: 0.05, h: 0.22, d: 0.05 }).color(0xb8ac90).at(PHONE.x - 0.06, PHONE.y - 0.11, PHONE.z + 0.06);
  kit.cylinder({ r: 0.045, h: 0.02, sides: 10 }).color(0x8a8070).at(PHONE.x + 0.03, PHONE.y - 0.04, PHONE.z + 0.04);
  kit.box({ w: 0.24, h: 0.32, d: 0.01 }).texture('tiles_white', { tile: 0.3 }).color(0xd0c8b0).at(PHONE.x + 0.32, PHONE.y - 0.3, z0 + 0.09);

  // A framed print of the church in summer over the desk, and the brewery's calendar.
  kit.box({ w: 0.04, h: 0.42, d: 0.56 }).color(0x3a2a1c).at(x0 + 0.1, 1.45, DESK.z);
  kit.box({ w: 0.01, h: 0.34, d: 0.48 }).texture('church_stone', { tile: 0.5 }).color(0x9aa08a).at(x0 + 0.125, 1.49, DESK.z);
  kit.box({ w: 0.01, h: 0.5, d: 0.34 }).texture('tiles_white', { tile: 0.4 }).color(0xd0c8b0).at(x0 + 0.09, 1.2, z1 - 0.6);
  kit.box({ w: 0.012, h: 0.16, d: 0.34 }).color(0x8a2a24).at(x0 + 0.09, 1.56, z1 - 0.6);

  const monitor = computerDesk(kit, dressing, props.useComputer);
  pendantLamp(kit, { x: x0 + 2.2, y: h, z: z0 + 1.2 }, { on: !night, intensity: 1.5, range: 5, drop: 0.45 });
  return monitor;
}

/** The desk, the yellowed 14-inch monitor, the tower, the keyboard, the cup, and the chair. */
function computerDesk(kit: LevelKit, dressing: InnDressing, use: () => void): Monitor {
  const { x, z, top } = DESK;
  kit.box({ w: 0.62, h: 0.04, d: 1.25 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5040).at(x, top - 0.04, z).collider();
  kit.box({ w: 0.6, h: top - 0.04, d: 0.04 }).color(0x4a3628).at(x, 0, z - 0.6);
  kit.box({ w: 0.6, h: top - 0.04, d: 0.04 }).color(0x4a3628).at(x, 0, z + 0.6);
  kit.box({ w: 0.4, h: 0.33, d: 0.38 }).color(CASE).at(x - 0.08, top, z);
  const screen = kit.box({ w: 0.04, h: 0.25, d: 0.3 }).color(dressing.night ? 0x10181a : 0x40607a).unlit().at(SCREEN.x, top + 0.05, z);
  kit.box({ w: 0.16, h: 0.05, d: 0.44 }).color(0xbab090).at(x + 0.24, top, z);
  kit.box({ w: 0.42, h: 0.38, d: 0.18 }).color(CASE).at(x, 0, z + 0.38);
  kit.box({ w: 0.13, h: 0.04, d: 0.2 }).color(0x3a3a38).at(x + 0.1, top, z - 0.32);
  // The cup that went cold.
  kit.cylinder({ r: 0.04, h: 0.08, sides: 8 }).color(0xd8d2c4).at(x + 0.16, top, z - 0.42);
  chair(kit, x + 0.7, z, 90);
  if (dressing.eveningThree) {
    // The coat on the chair, as the post says.
    kit.box({ w: 0.46, h: 0.55, d: 0.12 }).color(0x3e3c36).at(x + 0.88, 0.48, z);
  }
  // The screen glows; on the third evening it's the only light in the room.
  kit.glow(0.6, 0x203040).at(SCREEN.x + 0.12, SCREEN.y, z);
  const light = kit.light({ color: 0x7a9ab8, intensity: dressing.eveningThree ? 1.2 : 0.5, range: 3 }).at(SCREEN.x + 0.6, SCREEN.y, z);
  kit.hotspot({ prompt: 'Use the computer', radius: 0.55, onInteract: use }).at(x + 0.8, 0, z);
  return { screen, light };
}
