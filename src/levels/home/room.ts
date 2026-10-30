import { CanvasTexture, NearestFilter } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';

/** The reporter's one-room flat. The room spans x -2.2..2.2, z -1.9..1.9, and is 2.5 m high. */

export const ROOM = { halfW: 2.2, halfD: 1.9, height: 2.5 };
export const WINDOW = { x0: 0.55, x1: 1.45, y0: 0.95, y1: 2.05 };
export const DESK = { x: -0.9, z: -1.55, top: 0.74 };
/** The phone on the west wall. */
export const PHONE = { x: -ROOM.halfW + 0.04, y: 1.3, z: -0.4 };
/** Middle of the CRT's glass, where the player looks when seated. */
export const SCREEN = { x: DESK.x, y: DESK.top + 0.14 + 0.2, z: DESK.z + 0.13 };

const WALL = 'wallpaper_home';
const BEIGE = 0xcfc6ac;
/** Keeps the yellowed plastic reading as beige in the dark. */
const BEIGE_GLOW = 0x221f18;

export function walls(kit: LevelKit): void {
  const { halfW, halfD, height } = ROOM;
  const wall = (w: number, h: number, x: number, y: number, z: number, rot = 0) =>
    kit.box({ w, h, d: 0.12, cell: 0.6 }).texture(WALL, { tile: 1.2 }).at(x, y, z).rotY(rot).collider();
  const north = -halfD - 0.06;
  wall(WINDOW.x0 + halfW, height, (-halfW + WINDOW.x0) / 2, 0, north);
  wall(halfW - WINDOW.x1, height, (WINDOW.x1 + halfW) / 2, 0, north);
  wall(WINDOW.x1 - WINDOW.x0, WINDOW.y0, (WINDOW.x0 + WINDOW.x1) / 2, 0, north);
  wall(WINDOW.x1 - WINDOW.x0, height - WINDOW.y1, (WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y1, north);
  wall(halfW * 2, height, 0, 0, halfD + 0.06);
  wall(halfD * 2, height, -halfW - 0.06, 0, 0, 90);
  wall(halfD * 2, height, halfW + 0.06, 0, 0, 90);

  kit.plane({ w: halfW * 2, d: halfD * 2, cell: 0.5 }).texture('wood_floor', { tile: 1.4 }).walkable('wood');
  kit.ceiling({ w: halfW * 2, d: halfD * 2, cell: 0.6 }).texture('plaster_wall', { tile: 2 }).color(0x9a968c).at(0, height, 0);
  kit.plane({ w: 1.7, d: 1.2, cell: 0.4 }).texture('carpet', { tile: 1.2 }).at(0.1, 0.005, 0.35);
  // Skirting boards.
  [
    [halfW * 2, 0, -halfD + 0.01, 0],
    [halfW * 2, 0, halfD - 0.01, 0],
    [halfD * 2, -halfW + 0.01, 0, 90],
    [halfD * 2, halfW - 0.01, 0, 90],
  ].forEach(([w, x, z, rot]) => kit.box({ w: w!, h: 0.08, d: 0.02 }).color(0x5a4a38).at(x!, 0, z!).rotY(rot!));
}

/** The window: black glass, a white frame, a radiator under it, and the street lamp below. */
export function window(kit: LevelKit, onLook: () => void): void {
  const { x0, x1, y0, y1 } = WINDOW;
  const cx = (x0 + x1) / 2;
  const z = -ROOM.halfD - 0.04;
  kit.box({ w: x1 - x0, h: y1 - y0, d: 0.01 }).color(0x06080d).unlit().at(cx, y0, z - 0.02);
  const frame = (w: number, h: number, x: number, y: number) => kit.box({ w, h, d: 0.06 }).color(0xb8b4a8).at(x, y, z);
  frame(x1 - x0, 0.05, cx, y0);
  frame(x1 - x0, 0.05, cx, y1 - 0.05);
  frame(0.05, y1 - y0, x0 + 0.025, y0);
  frame(0.05, y1 - y0, x1 - 0.025, y0);
  frame(0.04, y1 - y0, cx, y0);
  frame(x1 - x0, 0.03, cx, (y0 + y1) / 2 + 0.1);
  kit.box({ w: x1 - x0 + 0.16, h: 0.04, d: 0.18 }).color(0xb8b4a8).at(cx, y0 - 0.04, z + 0.07);
  kit.hotspot({ prompt: 'Look out of the window', radius: 0.6, onInteract: onLook }).at(cx, 0, z + 0.5);

  kit.box({ w: 0.8, h: 0.5, d: 0.1 }).texture('rust_metal', { tile: 0.3 }).color(0xd8d4c8).at(cx, 0.22, -ROOM.halfD + 0.08).collider();

  // The street lamp below, seen through the rain. It has flickered since September.
  kit.glow(0.32, 0xffb060).at(cx + 0.24, y0 + 0.2, z + 0.03);
  kit.light({ color: 0xc87a40, intensity: 0.8, range: 4.2 }).flicker(0.55).at(cx, y0 + 0.4, z + 0.3);
}

/**
 * Rain running down the glass: short pale streaks that slide down and start again at the top.
 * Returns the per-frame update.
 */
export function rainStreaks(kit: LevelKit): (dt: number) => void {
  const { x0, x1, y0, y1 } = WINDOW;
  const z = -ROOM.halfD - 0.045;
  const streaks = Array.from({ length: 14 }, (_, i) => {
    const length = 0.08 + ((i * 37) % 10) / 60;
    const builder = kit.box({ w: 0.008, h: length, d: 0.004 }).color(0x4a5868).unlit().at(x0 + 0.06 + ((i * 0.619) % 1) * (x1 - x0 - 0.12), y0, z);
    return { builder, length, speed: 0.12 + ((i * 53) % 7) / 25, y: y0 + ((i * 0.383) % 1) * (y1 - y0) };
  });
  return (dt) =>
    streaks.forEach((streak) => {
      streak.y -= streak.speed * dt;
      if (streak.y < y0 + 0.05) streak.y = y1 - streak.length - 0.05;
      streak.builder.object.position.y = streak.y;
    });
}

/** A tiny desktop on the CRT glass, seen from across the room. */
function screenTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#1f7a76';
  context.fillRect(0, 0, 64, 48);
  context.fillStyle = '#e8e4d8';
  [4, 12, 20, 28, 36].forEach((y) => context.fillRect(3, y, 4, 4));
  context.fillStyle = '#c3bfb3';
  context.fillRect(16, 8, 40, 28);
  context.fillStyle = '#22356f';
  context.fillRect(16, 8, 40, 4);
  context.fillStyle = '#fff';
  context.fillRect(18, 14, 36, 20);
  context.fillStyle = '#888';
  [16, 19, 22, 25, 28].forEach((y) => context.fillRect(20, y, 20 + ((y * 7) % 12), 1));
  context.fillStyle = '#c3bfb3';
  context.fillRect(0, 44, 64, 4);
  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

export interface Desk {
  /** Turns the CRT picture on or off. */
  screen(on: boolean): void;
}

/** The desk with the beige PC, the CRT, keyboard, mouse, the green lamp, and the chair. */
export function desk(kit: LevelKit, onUse: () => void, usable: () => boolean): Desk {
  const { x, z, top } = DESK;
  kit.box({ w: 1.4, h: 0.04, d: 0.7 }).texture('wood_planks', { tile: 0.9 }).color(0x8a6a4a).at(x, top - 0.04, z).collider();
  kit.box({ w: 0.04, h: top - 0.04, d: 0.66 }).texture('wood_planks', { tile: 0.9 }).color(0x7a5a3c).at(x - 0.67, 0, z);
  kit.box({ w: 0.04, h: top - 0.04, d: 0.66 }).texture('wood_planks', { tile: 0.9 }).color(0x7a5a3c).at(x + 0.67, 0, z);
  kit.box({ w: 1.3, h: 0.4, d: 0.02 }).color(0x5e4632).at(x, 0.3, z - 0.3);

  // The desktop case with the monitor on top, both yellowing beige.
  kit.box({ w: 0.46, h: 0.14, d: 0.42 }).color(BEIGE).emissive(BEIGE_GLOW).at(x, top, z - 0.04);
  kit.box({ w: 0.12, h: 0.02, d: 0.01 }).color(0x333333).at(x - 0.1, top + 0.08, z + 0.175);
  kit.box({ w: 0.02, h: 0.012, d: 0.01 }).color(0x40e040).unlit().at(x + 0.17, top + 0.05, z + 0.175);
  kit.box({ w: 0.42, h: 0.38, d: 0.36 }).color(BEIGE).emissive(BEIGE_GLOW).at(x, top + 0.14, z - 0.06);
  kit.box({ w: 0.3, h: 0.26, d: 0.2 }).color(0xbab198).at(x, top + 0.2, z - 0.32);
  const glass = kit.box({ w: 0.33, h: 0.25, d: 0.01 }).texture('crt_screen', { tile: [0.33, 0.25] }).unlit().at(SCREEN.x, SCREEN.y - 0.125, z + 0.125);
  const picture = screenTexture();
  const dark = glass.mesh.material.uniforms.uMap.value;
  glass.mesh.material.uniforms.uMap.value = picture;

  kit.box({ w: 0.46, h: 0.03, d: 0.16 }).color(BEIGE).emissive(BEIGE_GLOW).at(x, top, z + 0.26);
  kit.box({ w: 0.42, h: 0.01, d: 0.12 }).color(0x8a836e).at(x, top + 0.03, z + 0.26);
  kit.box({ w: 0.22, h: 0.005, d: 0.2 }).color(0x1c2a44).at(x + 0.36, top, z + 0.24);
  kit.box({ w: 0.06, h: 0.03, d: 0.1 }).color(BEIGE).at(x + 0.36, top + 0.005, z + 0.24);
  // Papers and a mug.
  kit.box({ w: 0.21, h: 0.01, d: 0.3 }).color(0xd8d4c4).at(x + 0.48, top, z - 0.06).rotY(-12);
  kit.cylinder({ r: 0.04, h: 0.1, sides: 6 }).color(0x6a2a24).at(x - 0.45, top, z + 0.2);

  // The banker's lamp with its green shade.
  const lamp = { x: x - 0.5, z: z - 0.15 };
  kit.cylinder({ r: 0.07, h: 0.02, sides: 8 }).color(0x8a7040).at(lamp.x, top, lamp.z);
  kit.cylinder({ r: 0.012, h: 0.3, sides: 4 }).color(0x8a7040).at(lamp.x, top + 0.02, lamp.z);
  kit.box({ w: 0.26, h: 0.07, d: 0.11 }).color(0x1f5a32).at(lamp.x, top + 0.29, lamp.z + 0.04);
  kit.box({ w: 0.2, h: 0.01, d: 0.07 }).color(0xffe0a0).unlit().at(lamp.x, top + 0.285, lamp.z + 0.04);
  kit.glow(0.5, 0xffd890).at(lamp.x, top + 0.26, lamp.z + 0.05);
  kit.light({ color: 0xffd49a, intensity: 1.7, range: 3.6 }).flicker(0.02).at(lamp.x, top + 0.24, lamp.z + 0.12);
  // The CRT throws a cold glow on the desk and the chair.
  kit.light({ color: 0x5a8ab0, intensity: 0.7, range: 2.2 }).flicker(0.04).at(SCREEN.x, SCREEN.y, z + 0.5);

  // The chair, pushed back a little.
  const chair = { x, z: z + 0.75 };
  kit.box({ w: 0.46, h: 0.05, d: 0.44 }).color(0x2c2c30).at(chair.x, 0.44, chair.z);
  kit.box({ w: 0.44, h: 0.5, d: 0.05 }).color(0x2c2c30).at(chair.x, 0.52, chair.z + 0.22);
  kit.cylinder({ r: 0.03, h: 0.4, sides: 5 }).color(0x555555).at(chair.x, 0.04, chair.z);
  kit.box({ w: 0.5, h: 0.04, d: 0.06 }).color(0x333333).at(chair.x, 0, chair.z);
  kit.box({ w: 0.06, h: 0.04, d: 0.5 }).color(0x333333).at(chair.x, 0, chair.z);

  kit.hotspot({ prompt: 'Use the computer', radius: 0.7, enabled: usable, onInteract: onUse }).at(x, 0, z + 0.45);

  return {
    screen(on) {
      glass.mesh.material.uniforms.uMap.value = on ? picture : dark;
      glass.color(on ? 0xffffff : 0x111414);
    },
  };
}

/** The single bed along the east wall. */
export function bed(kit: LevelKit): void {
  const x = ROOM.halfW - 0.48;
  const z = 0.75;
  kit.box({ w: 0.92, h: 0.3, d: 2.02 }).texture('wood_planks', { tile: 0.8 }).color(0x6a5038).at(x, 0, z).collider();
  kit.box({ w: 0.86, h: 0.14, d: 1.96 }).color(0xb8b4aa).at(x, 0.3, z);
  kit.box({ w: 0.88, h: 0.06, d: 1.4 }).texture('carpet', { tile: 0.6 }).color(0x58607a).at(x, 0.42, z + 0.28);
  kit.box({ w: 0.6, h: 0.1, d: 0.32 }).color(0xd8d4ca).at(x, 0.44, z - 0.78);
  kit.box({ w: 0.92, h: 0.7, d: 0.05 }).texture('wood_planks', { tile: 0.8 }).color(0x6a5038).at(x, 0, z - 1.0);
}

/** The door with the coat hook beside it and the half-packed bag on the floor. */
export function doorSide(kit: LevelKit, actions: { onDoor: () => void; onCoat: () => void; onBag: () => void }): void {
  const z = ROOM.halfD - 0.02;
  kit.box({ w: 0.9, h: 2.05, d: 0.06 }).texture('door_wood', { tile: [0.9, 2.05] }).at(-1.2, 0, z).collider();
  kit.box({ w: 1.0, h: 0.06, d: 0.08 }).color(0xb8b4a8).at(-1.2, 2.05, z);
  kit.box({ w: 0.04, h: 0.04, d: 0.08 }).color(0xb09040).at(-0.85, 1.0, z - 0.05);
  // Light from the stairwell under the door.
  kit.box({ w: 0.86, h: 0.012, d: 0.01 }).color(0x9a7a48).unlit().at(-1.2, 0, z - 0.035);
  kit.light({ color: 0x8a6a3a, intensity: 0.45, range: 1.6 }).at(-1.2, 0.05, z - 0.25);
  kit.hotspot({ prompt: 'Open the door', radius: 0.55, onInteract: actions.onDoor }).at(-1.2, 0, z - 0.45);

  kit.box({ w: 0.3, h: 0.03, d: 0.04 }).color(0x5a4a38).at(-0.3, 1.75, z - 0.02);
  kit.box({ w: 0.42, h: 0.95, d: 0.12 }).color(0x3a2e24).at(-0.3, 0.82, z - 0.08);
  kit.box({ w: 0.3, h: 0.2, d: 0.13 }).color(0x32281e).at(-0.3, 1.58, z - 0.08);
  kit.hotspot({ prompt: 'Look at the coat', radius: 0.45, onInteract: actions.onCoat }).at(-0.3, 0, z - 0.4);

  kit.box({ w: 0.62, h: 0.3, d: 0.32 }).color(0x1e2a3e).at(0.45, 0, z - 0.3).rotY(8).collider();
  kit.box({ w: 0.5, h: 0.04, d: 0.2 }).color(0x7a7a72).at(0.45, 0.3, z - 0.3).rotY(8);
  kit.hotspot({ prompt: 'Look at the bag', radius: 0.5, onInteract: actions.onBag }).at(0.45, 0, z - 0.75);
}

/** A shelf of books and the phone on the wall. */
export function westWall(kit: LevelKit): void {
  const x = -ROOM.halfW + 0.16;
  kit.box({ w: 0.3, h: 1.4, d: 0.9 }).texture('wood_planks', { tile: 0.8 }).color(0x6a5038).at(x, 0, 0.6).collider();
  const colors = [0x6a2020, 0x203a5a, 0xa08a50, 0x2a4a2a, 0x5a3a5a, 0x8a5a2a, 0x3a3a3a];
  [0.35, 0.75, 1.15].forEach((y, row) =>
    colors.forEach((_, i) => {
      const height = 0.2 + ((i + row) % 3) * 0.03;
      kit.box({ w: 0.18, h: height, d: 0.05 }).color(colors[(i + row * 2) % colors.length]!).at(x, y, 0.25 + i * 0.1);
    }),
  );
  kit.box({ w: 0.08, h: 0.22, d: 0.12 }).color(0xcfc6ac).at(PHONE.x, PHONE.y, PHONE.z);
  kit.box({ w: 0.05, h: 0.18, d: 0.05 }).color(0xbab198).at(PHONE.x + 0.06, PHONE.y + 0.02, PHONE.z);
}
