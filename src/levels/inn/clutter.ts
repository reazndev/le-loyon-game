import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { handText, scrawl } from '../forest_path/scrawl';
import type { InnDressing } from './dressing';
import { WALL } from './interior';
import { CAFE, COUNTER, RADIATOR, ROOM3, STUBLI, TABLES, UPPER } from './layout';

/**
 * The small things of a village café that nobody has changed in twenty years: beer mats and
 * ashtrays on the cloths, a second coat and a hat on the rack, the chalk menu, the cigarette
 * machine, the papers on their sticks, the Jass mat and slate in the stübli, and the curtains in
 * room 3. All still, so it goes in one batch. The curtain that moves is returned for the scene.
 */

/** The cloth tops of the café tables, where the candle bottle stands. */
const CLOTH = 0.772;
const MATS = [0x8a2a22, 0xc8bc98, 0x3a5236, 0x9a7a3a];
const WEST = CAFE.x0 + WALL / 2;
const NORTH = CAFE.z0 + WALL / 2;

/** The curtain left of room 3's window, where the frame lets the cold in. */
export const DRAFTY_CURTAIN = { x: ROOM3.x1 - WALL / 2 - 0.06, y: UPPER + 2.13, z: RADIATOR.z - 0.52 };
const CURTAIN = { w: 0.3, h: 1.15, color: 0x7a6a58 };

export function innClutter(kit: LevelKit, dressing: InnDressing): Placed {
  kit.batch((still) => {
    if (!dressing.night) {
      TABLES.forEach((t, i) => tableTop(still, t.x, t.z, i));
      counterTop(still);
    } else {
      // Washed and stacked at the end of the counter for the morning.
      [0, 1, 2].forEach((i) => ashtray(still, CAFE.x1 - 0.35, COUNTER.h + i * 0.022, COUNTER.z, 0));
    }
    coats(still);
    menuBoard(still);
    cigaretteMachine(still);
    newspapers(still);
    jass(still);
    roomCurtains(still);
  });
  const drafty = kit.group((g) => curtain(g)).at(DRAFTY_CURTAIN.x, DRAFTY_CURTAIN.y, DRAFTY_CURTAIN.z);
  return drafty;
}

/** A pressed-glass ashtray with `butts` stubbed out in it. */
function ashtray(kit: LevelKit, x: number, y: number, z: number, butts: number): void {
  kit.cylinder({ r: 0.055, h: 0.022, sides: 8 }).color(0x8a948c).at(x, y, z);
  kit.cylinder({ r: 0.042, h: 0.003, sides: 8 }).color(0x4a4844).at(x, y + 0.02, z);
  Array.from({ length: butts }, (_, i) => {
    const a = i * 2.4 + x * 3;
    kit.box({ w: 0.032, h: 0.009, d: 0.009 }).color(0xc8b48a).at(x + Math.cos(a) * 0.02, y + 0.022, z + Math.sin(a) * 0.02).rotY(i * 70 + 20);
  });
}

function beerMat(kit: LevelKit, x: number, y: number, z: number, i: number): void {
  kit.cylinder({ r: 0.05, h: 0.003, sides: 8 }).color(MATS[i % MATS.length]!).at(x, y, z);
}

/** Mats and an ashtray on each cloth, kept off the corner where a plate or a cup goes. */
function tableTop(kit: LevelKit, x: number, z: number, i: number): void {
  ashtray(kit, x + 0.24, CLOTH, z + 0.26, 1 + (i % 3));
  beerMat(kit, x - 0.27, CLOTH, z + 0.22, i);
  if (i % 2) beerMat(kit, x + 0.27, CLOTH, z - 0.27, i + 1);
}

/** Gilles's ashtray, and a stack of mats by the till. */
function counterTop(kit: LevelKit): void {
  ashtray(kit, 1.85, COUNTER.h, COUNTER.z + 0.12, 4);
  [0, 1, 2, 3, 4, 5].forEach((i) => beerMat(kit, 3.95, COUNTER.h + i * 0.003, COUNTER.z + 0.08, i % 2 ? 0 : 1));
}

/** A loden coat on the other side of the rack, a felt hat on its top, and a scarf. */
function coats(kit: LevelKit): void {
  const rack = { x: CAFE.x1 - 0.35, z: CAFE.z1 - 0.4 };
  kit.box({ w: 0.14, h: 0.78, d: 0.36 }).color(0x4a4032).at(rack.x + 0.07, 0.92, rack.z - 0.12).rotY(8);
  kit.box({ w: 0.12, h: 0.5, d: 0.06 }).color(0x6a2e28).at(rack.x - 0.06, 1.2, rack.z + 0.1).rotY(-20);
  kit.cylinder({ r: 0.15, h: 0.012, sides: 10 }).color(0x2e2a26).at(rack.x, 1.8, rack.z);
  kit.cylinder({ r: 0.085, h: 0.1, sides: 8 }).color(0x34302a).at(rack.x, 1.81, rack.z);
}

/** The slate on the north wall by the corner table, chalked in Monique's hand. */
function menuBoard(kit: LevelKit): void {
  const x = -4.25;
  kit.box({ w: 0.64, h: 0.84, d: 0.03 }).texture('wood_planks', { tile: 0.5 }).color(0x4a3628).at(x, 1.24, NORTH + 0.015);
  kit.box({ w: 0.56, h: 0.76, d: 0.01 }).color(0x1c201e).at(x, 1.28, NORTH + 0.032);
  scrawl(kit, { w: 0.54, h: 0.72 }, [72, 96], (g) => {
    const chalk = { color: '#cfcbbf', font: '"Comic Sans MS", "Marker Felt", sans-serif' };
    handText(g, 'Menu du jour', 6, 8, { ...chalk, size: 11 });
    g.fillStyle = '#8a8880';
    g.fillRect(6, 15, 58, 1);
    [
      ['Soupe de chalet', 26],
      ['Rösti, saucisse', 40],
      ['  Fr. 14.50', 50],
      ['Jambon de la borne', 63],
      ['  Fr. 18.00', 73],
      ['Meringues, crème', 86],
    ].forEach(([text, y]) => handText(g, text as string, 4, y as number, { ...chalk, size: 8 }));
    // A line wiped off with a thumb, the smear of it still there.
    g.fillStyle = 'rgba(150, 150, 140, 0.35)';
    g.fillRect(8, 30, 44, 4);
  }).at(x, 0.92, NORTH + 0.04);
}

/**
 * The cigarette machine against the west wall: a mirror strip, the packs behind their glass, a
 * row of pulls. Built facing into the room.
 */
function cigaretteMachine(kit: LevelKit): void {
  const packs = [0xb02a22, 0xd8d4c8, 0x2a4a8a, 0xc8a83a, 0x8a2a22, 0x3a5a3a, 0xd8d4c8, 0x2a3a6a];
  kit
    .group((g) => {
      g.box({ w: 0.56, h: 1.5, d: 0.3 }).texture('rust_metal', { tile: 0.6 }).color(0x7a786e).at(0, 0.1, 0.15).collider();
      [-0.22, 0.22].forEach((lx) => g.box({ w: 0.04, h: 0.1, d: 0.04 }).color(0x2a2a28).at(lx, 0, 0.15));
      g.box({ w: 0.48, h: 0.2, d: 0.01 }).color(0x56606a).at(0, 1.32, 0.305);
      g.box({ w: 0.5, h: 0.34, d: 0.01 }).color(0x24282a).at(0, 0.84, 0.302);
      packs.forEach((color, i) => g.box({ w: 0.045, h: 0.07, d: 0.01 }).color(color).at(-0.19 + (i % 4) * 0.125 + (i > 3 ? 0.02 : 0), 0.88 + Math.floor(i / 4) * 0.15, 0.31));
      [-0.19, -0.065, 0.06, 0.185].forEach((px) => g.box({ w: 0.05, h: 0.03, d: 0.04 }).color(0xb0b0a8).at(px, 0.72, 0.32));
      g.box({ w: 0.04, h: 0.06, d: 0.012 }).color(0x1a1a18).at(0.2, 0.55, 0.306);
      g.box({ w: 0.3, h: 0.08, d: 0.06 }).color(0x3a3a36).at(0, 0.22, 0.32);
    })
    .at(WEST, 0, -0.85)
    .rotY(90);
}

/** La Liberté and the Freiburger Nachrichten on their wooden sticks, hung on a rail by the stübli door. */
function newspapers(kit: LevelKit): void {
  const z = 1.75;
  kit.box({ w: 0.04, h: 0.05, d: 0.62 }).texture('wood_planks', { tile: 0.4 }).color(0x4a3628).at(WEST + 0.02, 1.62, z);
  [-0.16, 0.16].forEach((dz, i) => kit.box({ w: 0.03, h: 0.022, d: 0.4 }).color(0x8a6a44).at(WEST + 0.05 + i * 0.012, 1.58, z + dz));
  scrawl(kit, { w: 0.6, h: 0.42 }, [64, 44], (g) => {
    [0, 34].forEach((x0, i) => {
      g.fillStyle = i ? '#c2bca8' : '#cbc6b4';
      g.fillRect(x0, 0, 30, 44 - i * 3);
      g.fillStyle = '#2a2a28';
      g.fillRect(x0 + 2, 2, 26, 5);
      g.fillStyle = '#7a786e';
      for (let y = 11; y < 40 - i * 3; y += 3) g.fillRect(x0 + 2 + ((y * 7) % 3), y, y % 9 ? 12 : 26, 1);
      for (let y = 11; y < 40 - i * 3; y += 3) g.fillRect(x0 + 16, y, 12 - ((y * 5) % 4), 1);
      g.fillStyle = '#5a5a56';
      g.fillRect(x0 + 15, 14, 1, 1);
    });
    handText(g, 'La Liberté', 3, 4.5, { size: 5, color: '#d8d4c4', font: 'serif' });
    handText(g, 'Freiburger N.', 36, 4.5, { size: 5, color: '#d8d4c4', font: 'serif' });
  })
    .at(WEST + 0.04, 1.15, z)
    .rotY(90);
}

/** The regulars' Jass mat with a dealt-out game left on it, and the slate with the points. */
function jass(kit: LevelKit): void {
  const table = { x: STUBLI.x0 + 2.2, z: STUBLI.z0 + 1.2, top: 0.76 };
  kit.box({ w: 0.42, h: 0.006, d: 0.42 }).color(0x2a4a34).at(table.x + 0.12, table.top, table.z + 0.12).rotY(6);
  [
    [0.05, 0.05, 10],
    [0.18, 0.02, -24],
    [0.1, 0.2, 40],
    [0.22, 0.18, 75],
  ].forEach(([dx, dz, yaw]) => kit.box({ w: 0.05, h: 0.005, d: 0.08 }).color(0xa8a08c).at(table.x + dx!, table.top + 0.006, table.z + dz!).rotY(yaw!));
  kit.box({ w: 0.05, h: 0.03, d: 0.08 }).color(0x9a927e).at(table.x + 0.3, table.top + 0.006, table.z + 0.32).rotY(-12);
  beerMat(kit, table.x - 0.28, table.top, table.z + 0.3, 0);

  // The Jass slate on the wall above the bench: two columns of strokes and the big Z.
  const x = STUBLI.x0 + 1.95;
  const z = STUBLI.z0 + WALL / 2;
  kit.box({ w: 0.42, h: 0.3, d: 0.02 }).texture('wood_planks', { tile: 0.4 }).color(0x4a3628).at(x, 1.05, z + 0.01);
  kit.box({ w: 0.36, h: 0.24, d: 0.01 }).color(0x1e2220).at(x, 1.08, z + 0.022);
  const chalk = (w: number, h: number, dx: number, y: number, tilt = 0) => {
    kit.box({ w, h, d: 0.004 }).color(0xb8b6ac).at(x + dx, y, z + 0.03).object.rotation.z = tilt;
  };
  chalk(0.005, 0.22, 0, 1.09);
  chalk(0.3, 0.005, 0, 1.25);
  chalk(0.3, 0.005, 0, 1.11);
  chalk(0.34, 0.005, 0, 1.18, 0.62);
  [-0.15, -0.13, -0.11, -0.09, 0.05, 0.07, 0.09].forEach((dx) => chalk(0.004, 0.035, dx, 1.27));
}

/** One curtain panel hanging from its hook, built down from the hook so it can swing. */
function curtain(kit: LevelKit): void {
  kit.box({ w: 0.015, h: CURTAIN.h, d: CURTAIN.w }).texture('carpet', { tile: 0.6 }).color(CURTAIN.color).at(0, -CURTAIN.h - 0.03, 0);
}

/** The rod over room 3's window and the right-hand curtain, which hangs still. */
function roomCurtains(kit: LevelKit): void {
  const { x, y } = DRAFTY_CURTAIN;
  kit.box({ w: 0.02, h: 0.02, d: 1.5 }).color(0x5a4a36).at(x, y, RADIATOR.z);
  kit.group((g) => curtain(g)).at(x, y, RADIATOR.z + 0.52);
}
