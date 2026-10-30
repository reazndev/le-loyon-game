import { TorusGeometry } from 'three';
import { hashString, seededRandom } from '../../engine/random';
import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { yawToward } from '../forest_path/trail';
import { BIN, chassotGrave, EAST_X, FRONT_Z, graves, SHED, TAP, WEST_X, type Grave } from './layout';

/**
 * Three weeks after All Saints: pots of chrysanthemums gone brown on most graves, a wreath or two
 * still leaning on a stone, plastic grave candles burned out. The watering cans on their rail by
 * the tap, a rake against the front wall, the heap of dead flowers behind the ossuary, and a bench
 * at the end of a row. All still, for the cemetery's batch.
 */

type Spot = { x: number; z: number };

/** Turns a prop so its -Z side faces `to`. */
const facing = (from: Spot, to: Spot) => yawToward(to.x - from.x, to.z - from.z);

const BROWN = [0x6a5440, 0x7a5e44, 0x5e4a3a, 0x8a7254, 0x9a8a6a];
const POT = 0x7a4e38;

/** Graves the story dresses itself: the Chassot plot, Odile's fresh flowers, Léa's windmill, the fresh flowers on Marie-Louise. */
const dressed = (grave: Grave) => grave === chassotGrave || grave.kind === 'flat' || grave.doc === 'grave_bapst_lea' || grave.doc === 'grave_yerly_ml';

export function cemeteryClutter(kit: LevelKit): void {
  graves.filter((grave) => !dressed(grave)).forEach((grave) => graveLeftovers(kit, grave));
  wateringCans(kit, TAP.x - 1, FRONT_Z - 0.48);
  rake(kit, BIN.x + 0.75, FRONT_Z - 0.58);
  flowerHeap(kit, (WEST_X + SHED.x - SHED.w / 2) / 2, SHED.z + 1.6);
  bench(kit, { x: EAST_X - 0.6, z: 2.46 }, { x: 0, z: 2.46 });
}

/** What is left on one grave, chosen by its own seed so every visit agrees. */
function graveLeftovers(kit: LevelKit, grave: Grave): void {
  const random = seededRandom(hashString(`leftovers-${grave.x}-${grave.z}`));
  const side = random() < 0.5 ? -1 : 1;
  const reach = Math.max(0.2, grave.w / 2 - 0.05);
  if (random() < 0.6) deadPot(kit, grave.x + side * reach, grave.z + 0.45 + random() * 0.9, random);
  if (random() < 0.22) wreath(kit, grave.x - side * 0.05, grave.z + 0.17, random);
  if (!grave.lantern && random() < 0.35) graveCandle(kit, grave.x - side * reach * 0.6, grave.z + 1.55);
}

/** A clay pot of chrysanthemums, the heads gone brown and bowed. */
function deadPot(kit: LevelKit, x: number, z: number, random: () => number): void {
  kit.cylinder({ r: 0.1, h: 0.15, sides: 6 }).color(POT).at(x, 0.06, z);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + random();
    kit
      .box({ w: 0.09, h: 0.07, d: 0.09 })
      .color(BROWN[Math.floor(random() * BROWN.length)]!)
      .at(x + Math.cos(a) * 0.045, 0.2 + random() * 0.05, z + Math.sin(a) * 0.045)
      .rotY(random() * 90);
  }
}

/** A wreath of fir and dead flowers leaning back on the face of the stone, its ribbon faded. */
function wreath(kit: LevelKit, x: number, z: number, random: () => number): void {
  const ring = kit.mesh(new TorusGeometry(0.2, 0.055, 4, 10)).color(0x3a4232).at(x, 0.28, z);
  ring.object.rotation.x = -0.25;
  kit.box({ w: 0.07, h: 0.06, d: 0.06 }).color(BROWN[Math.floor(random() * BROWN.length)]!).at(x - 0.1, 0.42, z + 0.04);
  kit.box({ w: 0.07, h: 0.06, d: 0.06 }).color(0x9a8a6a).at(x + 0.12, 0.2, z + 0.05);
  kit.box({ w: 0.05, h: 0.26, d: 0.01 }).color(random() < 0.5 ? 0x6a3a3a : 0x8a8478).at(x + 0.03, 0.02, z + 0.08).rotY(12);
}

/** A plastic grave candle from All Saints, the red cup burned out, the lid on. */
function graveCandle(kit: LevelKit, x: number, z: number): void {
  kit.cylinder({ r: 0.04, h: 0.12, sides: 6 }).color(0x6a2420).at(x, 0.06, z);
  kit.cylinder({ r: 0.042, h: 0.025, sides: 6 }).color(0x8a7a48).at(x, 0.18, z);
}

/**
 * The commune's watering cans on hooks from an iron rail by the tap. The green one on its chain
 * is the tap's own; these are for anyone.
 */
function wateringCans(kit: LevelKit, x: number, z: number): void {
  const iron = 0x3a3632;
  [-0.45, 0.45].forEach((dx) => kit.box({ w: 0.04, h: 1.05, d: 0.04 }).color(iron).at(x + dx, 0, z));
  kit.box({ w: 0.94, h: 0.03, d: 0.03 }).color(iron).at(x, 1.02, z);
  [
    [-0.25, 0x6e706c],
    [0.02, 0x626460],
    [0.28, 0x4e6a4a],
  ].forEach(([dx, color], i) => {
    kit.box({ w: 0.012, h: 0.12, d: 0.012 }).color(iron).at(x + dx!, 0.9, z);
    can(kit, color!).at(x + dx!, 0.56 - i * 0.03, z + 0.02).rotY(80 + i * 12);
  });
}

/** A watering can: the body, the handle over it, the long spout. */
function can(kit: LevelKit, color: number): Placed {
  return kit.group((g) => {
    g.cylinder({ r: 0.1, h: 0.24, sides: 7 }).color(color);
    g.box({ w: 0.02, h: 0.1, d: 0.12 }).color(color).at(0, 0.24, 0);
    const spout = g.box({ w: 0.025, h: 0.025, d: 0.26 }).color(color).at(0, 0.12, -0.2);
    spout.object.rotation.x = 0.6;
    g.cylinder({ r: 0.03, h: 0.03, sides: 5 }).color(color - 0x101010).at(0, 0.2, -0.31);
  });
}

/** A leaf rake against the front wall, its head up. */
function rake(kit: LevelKit, x: number, z: number): void {
  const handle = 0x8a7a5c;
  const length = 1.45;
  const lean = kit.group((g) => {
    g.box({ w: 0.035, h: length, d: 0.035 }).color(handle);
    g.box({ w: 0.42, h: 0.035, d: 0.035 }).color(0x5a5048).at(0, length, 0);
    for (let i = 0; i < 8; i++) g.box({ w: 0.01, h: 0.08, d: 0.01 }).color(0x5a5048).at(-0.18 + i * 0.051, length + 0.03, -0.02);
  });
  lean.at(x, 0, z).rotY(8);
  lean.object.rotation.x = 0.2;
}

/**
 * Behind the ossuary, in the corner of the walls: the heap where dead flowers and wreaths go,
 * inside three sides of old boards, with stacked empty pots and a bucket beside it.
 */
function flowerHeap(kit: LevelKit, x: number, z: number): void {
  const board = 0x5a5044;
  kit.box({ w: 1.5, h: 0.5, d: 0.05 }).texture('wood_planks', { tile: 0.8 }).color(board).at(x, 0, z + 0.6);
  [-1, 1].forEach((side) => kit.box({ w: 0.05, h: 0.45, d: 1.2 }).texture('wood_planks', { tile: 0.8 }).color(board).at(x + side * 0.75, 0, z));
  kit.box({ w: 1.4, h: 0.3, d: 1.1 }).texture('grave_dirt', { tile: 1 }).color(0x6a5a46).at(x, 0, z + 0.02);
  const random = seededRandom(hashString('flower-heap'));
  for (let i = 0; i < 14; i++) {
    kit
      .box({ w: 0.08, h: 0.05, d: 0.08 })
      .color(BROWN[i % 3]!)
      .at(x + (random() - 0.5) * 1.2, 0.28 + random() * 0.06, z + (random() - 0.5) * 0.9)
      .rotY(random() * 90);
  }
  const ring = kit.mesh(new TorusGeometry(0.22, 0.05, 4, 10)).color(0x42483a).at(x + 0.3, 0.38, z + 0.1);
  ring.object.rotation.x = -1.3;
  kit.box({ w: 0.06, h: 0.02, d: 0.3 }).color(0x8a8478).at(x - 0.3, 0.38, z + 0.2).rotY(30);
  kit.box({ w: 0.06, h: 0.02, d: 0.26 }).color(0x6a3a3a).at(x - 0.1, 0.4, z - 0.1).rotY(-50);
  kit.barrier({ w: 1.6, d: 1.3 }).at(x, 0, z);
  // Empty pots, nested, and a bucket.
  [0, 1, 2, 3].forEach((i) => kit.cylinder({ r: 0.1 - i * 0.004, h: 0.13, sides: 6 }).color(POT - 0x0a0806).at(x + 0.95, i * 0.04, z + 0.5));
  kit.cylinder({ r: 0.13, h: 0.28, sides: 7 }).color(0x8a8c86).at(x + 0.95, 0, z - 0.2);
  kit.cylinder({ r: 0.11, h: 0.01, sides: 7 }).color(0x2a2a26).at(x + 0.95, 0.275, z - 0.2);
}

/** A slatted bench on iron legs, its front toward `toward`, the paint gone grey. */
export function bench(kit: LevelKit, at: Spot, toward: Spot): void {
  const wood = 0x6e6458;
  const iron = 0x34322e;
  kit
    .group((g) => {
      [-0.07, 0.07].forEach((dz) => g.box({ w: 1.6, h: 0.04, d: 0.12 }).texture('wood_planks', { tile: 0.8 }).color(wood).at(0, 0.44, dz).collider());
      [0.6, 0.78].forEach((y) => g.box({ w: 1.6, h: 0.1, d: 0.03 }).texture('wood_planks', { tile: 0.8 }).color(wood).at(0, y, 0.18));
      [-0.65, 0.65].forEach((dx) => {
        g.box({ w: 0.05, h: 0.44, d: 0.34 }).color(iron).at(dx, 0, 0).collider();
        g.box({ w: 0.04, h: 0.48, d: 0.04 }).color(iron).at(dx, 0.44, 0.19);
      });
      // Someone's bag of bread for the birds, left folded under the seat.
      g.box({ w: 0.2, h: 0.02, d: 0.14 }).color(0xb4ab96).at(0.3, 0.01, -0.05).rotY(20);
    })
    .at(at.x, -0.05, at.z)
    .rotY(facing(at, toward))
    .onGround();
}
