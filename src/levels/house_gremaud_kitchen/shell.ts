import type { LevelKit } from '../../game/kit/levelKit';
import { floorAndCeiling, fogWindow, skirting, wall, WALL, type Finish } from '../inn/interior';
import { HALL_DOOR, LIVING_DOOR, ROOM, WINDOW } from './layout';

/** Cream paint over a pine wainscot, the way the commune's houses were done in the seventies. */
const WALLS: Finish = {
  texture: 'plaster_wall',
  tile: 1.4,
  color: 0xc4bca4,
  dado: { texture: 'wood_planks', color: 0xb0916a, h: 0.95, tile: 0.9 },
};

/** The walls, floor, and ceiling, the window over the sink, and the two doors. */
export function buildShell(kit: LevelKit, night: boolean): void {
  const { x0, x1, z0, z1, h } = ROOM;
  const corners: [number, number][] = [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];

  wall(kit, [x0, z0], [x1, z0], h, WALLS, [{ at: WINDOW.x - x0, w: WINDOW.w, h: WINDOW.h, y: WINDOW.y }]);
  wall(kit, [x1, z0], [x1, z1], h, WALLS);
  wall(kit, [x1, z1], [x0, z1], h, WALLS);
  wall(kit, [x0, z1], [x0, z0], h, WALLS);
  corners.forEach((from, i) => skirting(kit, from, corners[(i + 1) % corners.length]!, 0, 0x5a4634));

  floorAndCeiling(kit, ROOM, { texture: 'tiles_white', tile: 0.6, color: 0x8c7a66, surface: 'stone' }, { texture: 'plaster_wall', tile: 1.6, color: 0xa8a290 });
  fogWindow(kit, { x: WINDOW.x, z: z0, facing: 180, w: WINDOW.w, h: WINDOW.h, y: WINDOW.y, night });

  kit.door({ to: 'house_gremaud', spawn: 'from_kitchen', w: HALL_DOOR.w, h: HALL_DOOR.h, prompt: 'Go out' }).at(HALL_DOOR.x, 0, z1 - WALL / 2 - 0.03);
  // The living room stays shut. The television behind it is the only voice in the house.
  kit
    .box({ w: LIVING_DOOR.w, h: LIVING_DOOR.h, d: 0.04 })
    .texture('door_wood', { tile: [LIVING_DOOR.w, LIVING_DOOR.h] })
    .color(0xb0a490)
    .at(x0 + WALL / 2 + 0.02, 0, LIVING_DOOR.z)
    .rotY(90);
  kit.box({ w: 0.08, h: 0.025, d: 0.12 }).color(0x8a7a50).at(x0 + WALL / 2 + 0.06, 0.98, LIVING_DOOR.z - LIVING_DOOR.w / 2 + 0.1);
}
