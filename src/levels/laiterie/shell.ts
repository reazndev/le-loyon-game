import type { LevelKit } from '../../game/kit/levelKit';
import { fogWindow } from '../../game/kit/windows';
import { floorAndCeiling, pendantLamp, skirting, wall, WALL, type Finish } from '../inn/interior';
import { DAIRY_EDGE, DOOR, MILK_COUNTER, ROOM, SHOP_COUNTER, SHOP_WINDOW, SIDE_WINDOW } from './layout';

/** The walls, floors, ceiling, windows, and lamps of the laiterie. */

const FINISH: Finish = {
  texture: 'plaster_wall',
  tile: 1.8,
  color: 0xb2a68c,
  // White tiles to shoulder height, as a dairy has to be washed down.
  dado: { texture: 'tiles_white', color: 0x9c9e94, h: 1.25, tile: 0.9 },
};

export function buildShell(kit: LevelKit, night: boolean): void {
  const { x0, x1, z0, z1, h } = ROOM;
  floorAndCeiling(kit, { x0, x1: DAIRY_EDGE, z0, z1, h }, { texture: 'tiles_white', tile: 0.8, color: 0x7e7c72, surface: 'stone' }, { texture: 'plaster_wall', color: 0x8e8676 });
  floorAndCeiling(kit, { x0: DAIRY_EDGE, x1, z0, z1, h }, { texture: 'wood_floor', tile: 1.2, color: 0x8a7860 }, { texture: 'plaster_wall', color: 0x8e8676 });
  // The sill where the tiles meet the boards.
  kit.box({ w: 0.08, h: 0.02, d: z1 - z0 }).color(0x5a5248).at(DAIRY_EDGE, 0, (z0 + z1) / 2);

  wall(kit, [x0, z1], [x1, z1], h, FINISH, [
    { at: DOOR.x - x0, w: DOOR.w, h: DOOR.h },
    { at: SHOP_WINDOW.x - x0, w: SHOP_WINDOW.w, h: SHOP_WINDOW.h, y: SHOP_WINDOW.y },
  ]);
  wall(kit, [x1, z0], [x0, z0], h, FINISH);
  wall(kit, [x0, z0], [x0, z1], h, FINISH, [{ at: SIDE_WINDOW.z - z0, w: SIDE_WINDOW.w, h: SIDE_WINDOW.h, y: SIDE_WINDOW.y }]);
  wall(kit, [x1, z1], [x1, z0], h, FINISH);
  const inner = WALL / 2 + 0.02;
  skirting(kit, [DAIRY_EDGE, z0 + inner], [x1, z0 + inner]);
  skirting(kit, [x1 - inner, z0], [x1 - inner, z1]);

  fogWindow(kit, { x: SHOP_WINDOW.x, z: z1, facing: 0, w: SHOP_WINDOW.w, h: SHOP_WINDOW.h, y: SHOP_WINDOW.y, night, lamp: true });
  fogWindow(kit, { x: x0, z: SIDE_WINDOW.z, facing: -90, w: SIDE_WINDOW.w, h: SIDE_WINDOW.h, y: SIDE_WINDOW.y, night });

  // Shut at night: the bulbs hang dark.
  const lamp = (x: number, z: number, intensity: number) => pendantLamp(kit, { x, y: h, z }, { on: !night, intensity, range: 5, drop: 0.55, color: 0xffb860 });
  lamp(SHOP_COUNTER.x, SHOP_COUNTER.z + 0.3, 2);
  lamp(MILK_COUNTER.x - 0.2, MILK_COUNTER.z, 1.8);
  lamp(0.3, 1.3, 1.3);
}
