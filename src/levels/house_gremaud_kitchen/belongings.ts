import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { CALENDAR, COAT_HOOK, CRUCIFIX, DIARY, EAST, HER_CHAIR, PHOTO, PIPE, SOUTH, TABLE } from './layout';

const TOP = TABLE.h;

/**
 * Jean-Pierre's things, where he left them: his coat and hat by the door, boots under them, his
 * pipe at his place, and his photo, the crucifix, and the commune's calendar on the wall over
 * his chair. Odile's one cup is on her side. Returns the diary, which goes when she gives it.
 */
export function buildBelongings(kit: LevelKit): MeshBuilder {
  coat(kit);
  boots(kit);
  onEastWall(kit);
  crucifix(kit);

  kit.cylinder({ r: 0.075, h: 0.022, sides: 8 }).color(0x56605a).at(PIPE.x, TOP, PIPE.z);
  kit.cylinder({ r: 0.02, h: 0.045, sides: 6 }).color(0x2e1e14).at(PIPE.x + 0.02, TOP + 0.02, PIPE.z);
  kit.box({ w: 0.11, h: 0.012, d: 0.014 }).color(0x1c1410).at(PIPE.x - 0.05, TOP + 0.03, PIPE.z + 0.02).rotY(-25);

  kit.cylinder({ r: 0.07, h: 0.01, sides: 8 }).color(0xc8c2b0).at(HER_CHAIR.x + 0.42, TOP, HER_CHAIR.z - 0.05);
  kit.cylinder({ r: 0.038, h: 0.07, sides: 6 }).color(0xd0cab8).at(HER_CHAIR.x + 0.42, TOP + 0.01, HER_CHAIR.z - 0.05);

  return kit.box({ w: 0.09, h: 0.018, d: 0.14 }).color(0x131313).at(DIARY.x, TOP, DIARY.z).rotY(12);
}

/** His loden coat hanging from the hook west of the door, with his felt hat over it. */
function coat(kit: LevelKit): void {
  const { x, y } = COAT_HOOK;
  const z = SOUTH - 0.1;
  const LODEN = 0x464a3c;
  const SHADOW = 0x34372d;
  kit.box({ w: 0.05, h: 0.04, d: 0.08 }).color(0x6a5a40).at(x, y, SOUTH - 0.04);
  kit.box({ w: 0.4, h: 0.92, d: 0.12 }).color(LODEN).at(x, y - 1.0, z);
  kit.box({ w: 0.46, h: 0.14, d: 0.15 }).color(LODEN).at(x, y - 0.2, z);
  kit.box({ w: 0.2, h: 0.1, d: 0.16 }).color(SHADOW).at(x, y - 0.1, z);
  [-1, 1].forEach((side) => {
    kit.box({ w: 0.1, h: 0.6, d: 0.12 }).color(SHADOW).at(x + side * 0.2, y - 0.8, z - 0.02);
    kit.box({ w: 0.11, h: 0.03, d: 0.01 }).color(SHADOW).at(x + side * 0.1, y - 0.66, z - 0.065);
  });
  kit.box({ w: 0.015, h: 0.8, d: 0.01 }).color(0x2a2c24).at(x + 0.02, y - 0.95, z - 0.065);
  kit.cylinder({ r: 0.15, h: 0.015, sides: 8 }).color(0x3a342c).at(x, y + 0.04, z + 0.02);
  kit.cylinder({ r: 0.09, h: 0.09, sides: 8 }).color(0x3a342c).at(x, y + 0.05, z + 0.02);
}

/** His second pair of boots, side by side under the coat, toes to the room. */
function boots(kit: LevelKit): void {
  [-0.08, 0.08].forEach((dx) => {
    const x = COAT_HOOK.x + dx;
    kit.box({ w: 0.11, h: 0.09, d: 0.28 }).color(0x2a221c).at(x, 0, SOUTH - 0.22);
    kit.box({ w: 0.11, h: 0.24, d: 0.12 }).color(0x2a221c).at(x, 0.09, SOUTH - 0.13);
  });
}

/** Over his chair: his photo with the sash, and the commune's 1997 calendar still on January. */
function onEastWall(kit: LevelKit): void {
  const flat = (w: number, h: number, depth: number, color: number, z: number, y: number, inset = 0) =>
    kit.box({ w, h, d: depth }).color(color).at(EAST - depth / 2 - inset, y, z).rotY(90);

  const photo = PHOTO;
  flat(0.28, 0.34, 0.025, 0x3a2a1c, photo.z, photo.y);
  flat(0.22, 0.28, 0.01, 0x8a8068, photo.z, photo.y + 0.03, 0.025);
  // His shape: a dark suit, a pale face, and the sash across from the shoulder.
  flat(0.12, 0.14, 0.005, 0x2a2826, photo.z, photo.y + 0.03, 0.035);
  flat(0.05, 0.06, 0.005, 0xb09a80, photo.z, photo.y + 0.18, 0.035);
  flat(0.13, 0.025, 0.004, 0xd8d4c8, photo.z, photo.y + 0.12, 0.04).object.rotation.x = 0.5;

  const calendar = CALENDAR;
  flat(0.32, 0.46, 0.008, 0xcac2aa, calendar.z, calendar.y);
  flat(0.28, 0.18, 0.004, 0x5e6e72, calendar.z, calendar.y + 0.25, 0.008);
  flat(0.12, 0.03, 0.004, 0x7a2a24, calendar.z, calendar.y + 0.2, 0.008);
  [0, 1, 2, 3, 4].forEach((row) => flat(0.26, 0.006, 0.004, 0x8a8470, calendar.z, calendar.y + 0.04 + row * 0.03, 0.008));
  kit.cylinder({ r: 0.006, h: 0.02, sides: 4 }).color(0x8a8a80).at(EAST - 0.01, calendar.y + 0.47, calendar.z);
}

/** The crucifix over his place, dark wood with a pale Christ and a sprig of blessed box. */
function crucifix(kit: LevelKit): void {
  const { z, y } = CRUCIFIX;
  const piece = (w: number, h: number, depth: number, color: number, dy: number, inset = 0) =>
    kit.box({ w, h, d: depth }).color(color).at(EAST - depth / 2 - inset, y + dy, z).rotY(90);
  kit.box({ w: 0.03, h: 0.1, d: 0.07 }).color(0x3a4430).at(EAST - 0.05, y + 0.36, z - 0.06).rotY(25);
  piece(0.05, 0.5, 0.03, 0x4a3020, 0);
  piece(0.28, 0.05, 0.03, 0x4a3020, 0.33);
  piece(0.04, 0.2, 0.015, 0xc8bea4, 0.14, 0.03);
  piece(0.22, 0.03, 0.015, 0xc8bea4, 0.34, 0.03);
  piece(0.05, 0.05, 0.015, 0xc8bea4, 0.35, 0.03);
}
