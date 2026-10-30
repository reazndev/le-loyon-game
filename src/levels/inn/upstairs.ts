import type { Group } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { movingBlocker } from '../bunker_interior/concrete';
import { everyFrame } from '../church/everyFrame';
import { playNode } from '../forest_path/play';
import type { InnDressing } from './dressing';
import { chair } from './furniture';
import { fogWindow, floorAndCeiling, pendantLamp, skirting, wall, type Finish } from './interior';
import { BED, CORRIDOR, CORRIDOR_DOORS, RADIATOR, ROOM3, ROOM3_DESK, ROOM3_DOOR, STAIRS, UPPER } from './layout';

/** The stairs, the upstairs corridor with its doors, and room 3 under the roof. */

const UPPER_WALLS: Finish = {
  texture: 'wallpaper_inn',
  tile: 1.2,
  color: 0xa89a80,
  dado: { texture: 'wood_planks', color: 0x5a4434, h: 0.9, tile: 1 },
};
const STAIRWELL: Finish = { texture: 'plaster_wall', tile: 1.8, color: 0x6e675c };

export interface Room3Props {
  onBed: () => void;
  onWindow: () => void;
}

export function buildUpstairs(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, props: Room3Props): void {
  stairs(kit, dressing);
  corridor(kit, ctx, dressing);
  room3(kit, ctx, dressing, props);
}

function stairs(kit: LevelKit, dressing: InnDressing): void {
  const { x0, x1, z0, z1, steps } = STAIRS;
  const rise = UPPER / steps;
  const tread = (z0 - z1) / steps;
  for (let i = 0; i < steps; i++) {
    kit
      .box({ w: x1 - x0, h: rise * (i + 1), d: tread + 0.01, cell: 0.5 })
      .texture('wood_planks', { tile: 0.8 })
      .color(i % 2 ? 0x5e4634 : 0x664c38)
      .at((x0 + x1) / 2, 0, z0 - tread * (i + 0.5))
      .walkable('wood');
  }
  const top = UPPER + CORRIDOR.h;
  wall(kit, [x0, z0], [x0, z1], top, STAIRWELL);
  wall(kit, [x1, z0], [x1, z1], top, STAIRWELL);
  kit.ceiling({ w: x1 - x0, d: z0 - z1, cell: 0.8 }).texture('plaster_wall', { tile: 2 }).color(0x6a645a).at((x0 + x1) / 2, top, (z0 + z1) / 2);
  // The handrail, worn pale where hands go.
  kit.box({ w: 0.05, h: 0.05, d: Math.hypot(z0 - z1, UPPER) }).color(0x8a6e50).at(x1 - 0.12, 0.95 + UPPER / 2, (z0 + z1) / 2).object.rotation.set(Math.atan2(UPPER, z0 - z1), 0, 0);
  pendantLamp(kit, { x: (x0 + x1) / 2, y: top, z: z1 + 0.6 }, { intensity: dressing.night ? 0.7 : 0.9, range: 4.5, color: 0xf0b070, drop: 0.3, flicker: 0.08 });
}

function corridor(kit: LevelKit, ctx: SceneContext, dressing: InnDressing): void {
  const { x0, x1, z0, z1, h } = CORRIDOR;
  wall(kit, [STAIRS.x1, z1], [x1, z1], h, UPPER_WALLS, [], UPPER);
  wall(kit, [x0, z0], [x1, z0], h, UPPER_WALLS, [], UPPER);
  wall(kit, [x0, z1], [x0, z0], h, UPPER_WALLS, [{ at: 0.7, w: 0.6, h: 0.8, y: 1.1 }], UPPER);
  fogWindow(kit, { x: x0, z: (z0 + z1) / 2, facing: -90, w: 0.6, h: 0.8, y: 1.1, night: dressing.night, base: UPPER });
  floorAndCeiling(kit, { ...CORRIDOR, y: UPPER }, { texture: 'wood_floor', tile: 1.2, color: 0x7a6a5a }, { texture: 'plaster_wall', tile: 2, color: 0x8a8274 });
  // A runner down the middle of the boards.
  kit.box({ w: x1 - x0 - 0.6, h: 0.008, d: 0.7 }).texture('carpet', { tile: 0.9 }).color(0x8a5a4a).at((x0 + x1) / 2 + 0.2, UPPER, (z0 + z1) / 2);
  skirting(kit, [x0, z0 + 0.09], [x1, z0 + 0.09], UPPER);

  CORRIDOR_DOORS.forEach((door) => {
    const z = z0 + 0.1;
    kit.box({ w: 0.85, h: 2.05, d: 0.05 }).texture('door_wood', { tile: [0.85, 2.05] }).color(0x9a8a78).at(door.x, UPPER, z).collider();
    kit.box({ w: 0.05, h: 0.05, d: 0.05 }).color(0xb8a060).at(door.x + 0.32, UPPER + 1.0, z + 0.04);
    if (door.label === 'yannick') {
      // A moped sticker and a football club pennant.
      kit.box({ w: 0.22, h: 0.14, d: 0.01 }).color(0xc8b040).at(door.x, UPPER + 1.5, z + 0.03);
      kit.box({ w: 0.12, h: 0.3, d: 0.01 }).color(0x2a3a8a).at(door.x - 0.2, UPPER + 1.35, z + 0.03).rotY(0);
    } else {
      kit.box({ w: 0.1, h: 0.12, d: 0.01 }).color(0xd8d0b8).at(door.x, UPPER + 1.6, z + 0.03);
    }
    kit
      .hotspot({ prompt: 'Try the door', radius: 0.5, onInteract: () => void ctx.say('Locked.') })
      .at(door.x, UPPER, z + 0.5);
  });
  // A chest of drawers with a doily and a plastic Virgin from Lourdes.
  kit.box({ w: 0.8, h: 0.8, d: 0.4 }).texture('wood_planks', { tile: 0.6 }).color(0x5a4232).at(3.0, UPPER, z1 - 0.25).collider();
  kit.cylinder({ r: 0.04, h: 0.2, sides: 6 }).color(0xb8c4d0).at(3.1, UPPER + 0.8, z1 - 0.25);
  pendantLamp(kit, { x: 1.8, y: UPPER + h, z: (z0 + z1) / 2 }, { intensity: dressing.night ? 0.6 : 0.8, range: 4.5, color: 0xf0b878, drop: 0.25, flicker: 0.1 });
}

function room3(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, props: Room3Props): void {
  const { x0, x1, z0, z1, h } = ROOM3;
  const night = dressing.night;
  wall(kit, [x0, z1], [x0, z0], h, UPPER_WALLS, [{ at: z1 - ROOM3_DOOR.z, w: ROOM3_DOOR.w, h: ROOM3_DOOR.h }], UPPER);
  wall(kit, [x0, z0], [x1, z0], h, UPPER_WALLS, [], UPPER);
  wall(kit, [x0, z1], [x1, z1], h, UPPER_WALLS, [], UPPER);
  wall(kit, [x1, z1], [x1, z0], h, UPPER_WALLS, [{ at: z1 - RADIATOR.z, w: 0.9, h: 1.1, y: 0.95 }], UPPER);
  fogWindow(kit, { x: x1, z: RADIATOR.z, facing: 90, w: 0.9, h: 1.1, y: 0.95, night, base: UPPER, lamp: true });
  floorAndCeiling(kit, { ...ROOM3, y: UPPER }, { texture: 'wood_floor', tile: 1.1, color: 0x7a6a58 }, { texture: 'plaster_wall', tile: 2, color: 0x8a8476 });
  // The roof comes down over the bed.
  kit.box({ w: x1 - x0, h: 0.08, d: 1.3 }).texture('plaster_wall', { tile: 2 }).color(0x7e786c).at((x0 + x1) / 2, UPPER + h - 0.55, z0 + 0.55).object.rotation.set(-0.7, 0, 0);
  kit.box({ w: x1 - x0, h: 0.08, d: 1.0 }).texture('carpet', { tile: 0.9 }).color(0x6a4a3e).at(BED.x - 0.4, UPPER, BED.z + 1.1);

  bed(kit, props.onBed);
  // The crucifix over the bed, the washbasin and its mirror, the radiator under the window.
  kit.box({ w: 0.04, h: 0.36, d: 0.03 }).color(0x3a2a1c).at(BED.x, UPPER + 1.35, z0 + 0.09);
  kit.box({ w: 0.2, h: 0.04, d: 0.03 }).color(0x3a2a1c).at(BED.x, UPPER + 1.58, z0 + 0.09);
  kit.box({ w: 0.5, h: 0.16, d: 0.38 }).texture('tiles_white', { tile: 0.3 }).color(0xd8d4c8).at(8.1, UPPER + 0.7, z1 - 0.27).collider();
  kit.cylinder({ r: 0.04, h: 0.7, sides: 6 }).color(0xd0ccc0).at(8.1, UPPER, z1 - 0.2);
  kit.box({ w: 0.4, h: 0.5, d: 0.01 }).color(night ? 0x14181c : 0x6a7478).unlit().at(8.1, UPPER + 1.2, z1 - 0.09);
  kit.box({ w: 0.16, h: 0.05, d: 0.08 }).color(0xd8c8a0).at(8.3, UPPER + 0.86, z1 - 0.2);
  kit.box({ w: 0.8, h: 0.5, d: 0.1 }).texture('rust_metal', { tile: 0.3 }).color(0xd0ccc0).at(RADIATOR.x - 0.08, UPPER + 0.2, RADIATOR.z).rotY(90).collider();
  // The little table where the piece gets written, and its chair.
  kit.box({ w: 0.7, h: 0.04, d: 0.5 }).texture('wood_planks', { tile: 0.6 }).color(0x6a4e36).at(ROOM3_DESK.x, UPPER + 0.72, ROOM3_DESK.z).collider();
  [-0.3, 0.3].forEach((dx) => [-0.2, 0.2].forEach((dz) => kit.box({ w: 0.04, h: 0.72, d: 0.04 }).color(0x4a3626).at(ROOM3_DESK.x + dx, UPPER, ROOM3_DESK.z + dz)));
  chair(kit, ROOM3_DESK.x, ROOM3_DESK.z + 0.6, 0);
  // A wardrobe by the door.
  kit.box({ w: 0.9, h: 1.9, d: 0.55 }).texture('wood_planks', { tile: 0.9 }).color(0x4e3a2a).at(x0 + 0.5, UPPER, z1 - 0.35).rotY(90).collider();

  kit.hotspot({ prompt: 'Look out of the window', radius: 0.55, onInteract: props.onWindow }).at(x1 - 0.6, UPPER, RADIATOR.z);
  // The bedside lamp; by day the window does the work.
  kit.box({ w: 0.3, h: 0.5, d: 0.3 }).texture('wood_planks', { tile: 0.4 }).color(0x4e3a2a).at(BED.x - 1.25, UPPER, z0 + 0.25);
  kit.cylinder({ r: 0.1, h: 0.14, sides: 8 }).color(night ? 0xe8c890 : 0xa89a80).at(BED.x - 1.25, UPPER + 0.68, z0 + 0.25);
  if (night) {
    kit.glow(0.5, 0x6a4a20).at(BED.x - 1.25, UPPER + 0.75, z0 + 0.25);
    kit.light({ color: 0xffb870, intensity: 1.7, range: 4.6 }).flicker(0.03).at(BED.x - 1.25, UPPER + 1.0, z0 + 0.5);
  } else {
    pendantLamp(kit, { x: 7.6, y: UPPER + h, z: (z0 + z1) / 2 }, { intensity: 0.7, range: 4, drop: 0.3 });
  }

  door3(kit, ctx);
}

/** An iron bed, a thin mattress, a grey blanket, one pillow. */
function bed(kit: LevelKit, onBed: () => void): void {
  const { x, z } = BED;
  const iron = 0x2a2a2c;
  [-0.95, 0.95].forEach((dx) => {
    kit.box({ w: 0.04, h: dx > 0 ? 1.0 : 0.75, d: 0.95 }).color(iron).at(x + dx, UPPER, z);
    [-0.45, 0.45].forEach((dz) => kit.cylinder({ r: 0.025, h: dx > 0 ? 1.05 : 0.8, sides: 5 }).color(iron).at(x + dx, UPPER, z + dz));
  });
  kit.box({ w: 1.9, h: 0.16, d: 0.9 }).color(0xc8c4b8).at(x, UPPER + 0.38, z).collider();
  kit.box({ w: 1.4, h: 0.05, d: 0.94 }).texture('carpet', { tile: 0.5 }).color(0x6e6a64).at(x - 0.22, UPPER + 0.54, z);
  kit.box({ w: 0.36, h: 0.1, d: 0.6 }).color(0xe0dcd0).at(x + 0.68, UPPER + 0.54, z);
  kit.hotspot({ prompt: 'Lie down', radius: 0.7, onInteract: onBed }).at(x - 0.3, UPPER, z + 0.6);
}

/** Room 3's door opens with Monique's key and stays open. */
function door3(kit: LevelKit, ctx: SceneContext): void {
  let open = false;
  let swing = 0;
  const hinge = { x: ROOM3.x0, z: ROOM3_DOOR.z - ROOM3_DOOR.w / 2 };
  const leaf = kit
    .group((g) => {
      g.box({ w: ROOM3_DOOR.w - 0.02, h: ROOM3_DOOR.h, d: 0.05 }).texture('door_wood', { tile: [0.85, 2.05] }).color(0x9a8a78).at(-(ROOM3_DOOR.w - 0.02) / 2, 0, 0);
      g.box({ w: 0.12, h: 0.14, d: 0.06 }).color(0xd8d0b8).at(-ROOM3_DOOR.w / 2, 1.6, 0);
      g.box({ w: 0.05, h: 0.05, d: 0.08 }).color(0xb8a060).at(-ROOM3_DOOR.w + 0.12, 1.0, 0);
    })
    .at(hinge.x - 0.05, UPPER, hinge.z)
    .rotY(90);
  kit
    .hotspot({
      prompt: () => (ctx.state.hasItem('inn_room_key') ? 'Unlock room 3' : 'Try the door'),
      radius: 0.55,
      enabled: () => !open,
      onInteract: () => {
        if (!ctx.state.hasItem('inn_room_key')) return void ctx.say('Room 3. Locked. Monique has the key.');
        open = true;
      },
    })
    .at(ROOM3.x0 - 0.45, UPPER, ROOM3_DOOR.z);
  const block = movingBlocker(() => (open ? null : { kind: 'box', x: ROOM3.x0, z: ROOM3_DOOR.z, hw: 0.1, hd: ROOM3_DOOR.w / 2, angle: 0 }));
  everyFrame(kit, (dt) => {
    block(dt, ctx);
    if (!open || swing >= 1) return;
    // Inward, into the room.
    swing = Math.min(1, swing + dt / 1.2);
    (leaf.object as Group).rotation.y = Math.PI / 2 + (100 * swing * Math.PI) / 180;
  });
}

/** Plays the room 3 window look for this night. */
export function lookOutOfRoom3(ctx: SceneContext): Promise<void> {
  const nightTwo = ctx.state.time === 'night' && ctx.state.count('night') === 2 && !ctx.state.hasFlag('opened_coffin');
  return playNode(ctx, nightTwo ? 'room_window_night2' : 'room_window');
}
