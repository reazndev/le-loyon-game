import type { LevelKit } from '../../game/kit/levelKit';
import { handText, scrawl } from '../forest_path/scrawl';

/**
 * The small things of three years lived underground, all still: a crate by the south wall with
 * the radio on it, a washstand, boots, folded blankets, opened tins, rolled and pinned maps,
 * candle stubs. Everything stays off the middle of the room, where Marc walks, and out of the
 * far corner where he stands in the dark.
 */

/** Where the radio sits, for its sound. */
export const RADIO = { x: 2.2, y: 0.56, z: 1.78 };

const ENAMEL = 0x9c988a;
const TIN = 0x8a8a84;

export function clutter(kit: LevelKit): void {
  kit.batch((still) => {
    radioCrate(still);
    washstand(still);
    [1.6, 1.78].forEach((z, i) => boot(still, 3.08 + i * 0.05, z));
    [1.66, 1.8].forEach((z, i) => boot(still, 3.2 + i * 0.04, z));
    blankets(still);
    emptyTins(still);
    shelfExtras(still);
    // A mug left by the candle, and the wax of older candles on the table edge.
    mug(still, 3.18, 0.752, -1.2);
    still.cylinder({ r: 0.03, h: 0.012, sides: 6 }).color(0xd0c8b0).at(1.95, 0.752, -1.25);
  });
  pinnedMap(kit);
}

function radioCrate(kit: LevelKit): void {
  kit.box({ w: 0.55, h: 0.5, d: 0.4 }).texture('wood_planks', { tile: 0.6 }).color(0x5e5040).at(2.3, 0, 1.75).collider();
  const top = 0.5;
  // A small army transistor set, its dial still faintly lit: it was never switched off.
  kit.box({ w: 0.24, h: 0.13, d: 0.09 }).color(0x3a3a30).at(RADIO.x, top, RADIO.z);
  kit.box({ w: 0.11, h: 0.025, d: 0.004 }).color(0x8a6020).emissive(0x5a3408).at(RADIO.x - 0.04, top + 0.075, RADIO.z - 0.047);
  kit.cylinder({ r: 0.018, h: 0.012, sides: 6 }).color(0x1a1a18).at(RADIO.x + 0.08, top + 0.07, RADIO.z - 0.05).object.rotation.set(Math.PI / 2, 0, 0);
  kit.box({ w: 0.006, h: 0.32, d: 0.006 }).color(0x6a6a66).at(RADIO.x + 0.1, top + 0.13, RADIO.z + 0.02).object.rotation.set(0, 0, -0.35);
  mug(kit, 2.47, top, 1.66);
  openTin(kit, 2.06, top, 1.64);
  candleStub(kit, 2.52, top, 1.84, 0.04);
}

/** The basin on its stand by the door, a skin of grey water in it, the jug beside. */
function washstand(kit: LevelKit): void {
  const top = 0.72;
  kit.box({ w: 0.48, h: top, d: 0.36 }).texture('wood_planks', { tile: 0.6 }).color(0x4e4236).at(1.1, 0, 1.76).collider();
  kit.cylinder({ r: 0.17, h: 0.08, sides: 10 }).color(ENAMEL).at(1.04, top, 1.76);
  kit.cylinder({ r: 0.15, h: 0.004, sides: 10 }).color(0x3a3a36).at(1.04, top + 0.05, 1.76);
  kit.cylinder({ r: 0.055, h: 0.2, sides: 8 }).color(ENAMEL).at(1.27, top, 1.8);
  kit.box({ w: 0.012, h: 0.012, d: 0.012 }).color(0x1e2a3a).at(1.27, top + 0.2, 1.75);
  // A grey towel over the rail.
  kit.box({ w: 0.26, h: 0.3, d: 0.02 }).color(0x48463e).at(1.1, top - 0.32, 1.57);
}

/** An army boot lying along X, toe to the west. */
function boot(kit: LevelKit, x: number, z: number): void {
  kit.box({ w: 0.29, h: 0.05, d: 0.1 }).color(0x1e1a16).at(x, 0, z);
  kit.box({ w: 0.12, h: 0.2, d: 0.09 }).color(0x2a241e).at(x + 0.08, 0.05, z);
}

/** Spare army blankets, folded square and stacked by the bed. */
function blankets(kit: LevelKit): void {
  [0x4e4e3a, 0x5a5640, 0x4a4a38].forEach((color, i) =>
    kit.box({ w: 0.46, h: 0.07, d: 0.34 }).texture('camo_cape', { tile: 1 }).color(color).at(5.62, i * 0.07, 0.98).rotY(i * 4 - 4),
  );
}

/** Opened tins by the stove, scraped clean. */
function emptyTins(kit: LevelKit): void {
  [
    [5.38, 0.78],
    [5.3, 0.92],
    [5.46, 0.95],
  ].forEach(([x, z]) => openTin(kit, x!, 0, z!));
  // One on its side.
  kit.cylinder({ r: 0.04, h: 0.1, sides: 7 }).color(TIN).at(5.2, 0.04, 0.8).object.rotation.set(Math.PI / 2, 0, 0.6);
}

/** Two rolled maps on the top shelf, and candle stubs on the middle one. */
function shelfExtras(kit: LevelKit): void {
  [-1.74, -1.86].forEach((z, i) => kit.cylinder({ r: 0.03, h: 0.5, sides: 6 }).color(i ? 0x9a9478 : 0x8a8a6a).at(4.87, 1.61, z).object.rotation.set(0, 0, Math.PI / 2));
  [3.7, 3.78, 3.86].forEach((x, i) => candleStub(kit, x, 0.98, -1.78, 0.03 + i * 0.015));
  [3.75, 3.85].forEach((x) => openTin(kit, x, 0.38, -1.8));
}

function openTin(kit: LevelKit, x: number, y: number, z: number): void {
  kit.cylinder({ r: 0.04, h: 0.1, sides: 7 }).color(TIN).at(x, y, z);
  kit.cylinder({ r: 0.034, h: 0.003, sides: 7 }).color(0x2a2824).at(x, y + 0.1, z);
  // The lid, bent back on its last bit of rim.
  kit.cylinder({ r: 0.038, h: 0.003, sides: 7 }).color(0x9a9a90).at(x + 0.03, y + 0.12, z).object.rotation.set(0, 0, 1.1);
}

function mug(kit: LevelKit, x: number, y: number, z: number): void {
  kit.cylinder({ r: 0.04, h: 0.085, sides: 7 }).color(ENAMEL).at(x, y, z);
  kit.cylinder({ r: 0.036, h: 0.003, sides: 7 }).color(0x2a2a2a).at(x, y + 0.085, z);
  kit.box({ w: 0.012, h: 0.05, d: 0.03 }).color(0x1e2a3a).at(x + 0.045, y + 0.02, z);
}

function candleStub(kit: LevelKit, x: number, y: number, z: number, h: number): void {
  kit.cylinder({ r: 0.02, h, sides: 6 }).color(0xd0c8b0).at(x, y, z);
  kit.box({ w: 0.003, h: 0.012, d: 0.003 }).color(0x111111).at(x, y + h, z);
}

/** A 1:25 000 army sheet pinned over the table, ringed in grease pencil. */
function pinnedMap(kit: LevelKit): void {
  scrawl(kit, { w: 0.62, h: 0.46 }, [50, 36], (g) => {
    g.fillStyle = '#8e8a70';
    g.fillRect(0, 0, 50, 36);
    g.strokeStyle = '#6e6a54';
    [9, 18, 27, 36, 45].forEach((x) => g.strokeRect(x, 0, 0, 36));
    [9, 18, 27].forEach((y) => g.strokeRect(0, y, 50, 0));
    g.strokeStyle = '#5a5a44';
    [6, 11, 16].forEach((r) => {
      g.beginPath();
      g.ellipse(20, 20, r * 1.4, r, -0.3, 0, Math.PI * 2);
      g.stroke();
    });
    g.strokeStyle = '#2a2a2e';
    g.beginPath();
    g.arc(34, 12, 4, 0, Math.PI * 2);
    g.stroke();
    handText(g, 'X', 32, 12, { size: 6, color: '#2a2a2e', font: 'monospace' });
    g.fillStyle = '#6a2a20';
    [[1, 1], [48, 1], [1, 34], [48, 34]].forEach(([x, y]) => g.fillRect(x!, y!, 2, 2));
  }).at(1.75, 1.1, -1.985);
}
