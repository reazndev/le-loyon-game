import { CylinderGeometry } from 'three';
import { seededRandom } from '../../engine/random';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { readDocument } from '../forest_path/play';
import { WALL } from '../inn/interior';
import { BELL, CLOCK, CORK_BOARD, RADIO, ROOM, SHOP_COUNTER } from './layout';

/** The shop side: the counter and what is on it, the shelves, the cork board, the bell, the clock. */

const WOOD = 0x6a5038;
const DARK_WOOD = 0x463628;

/** Labels of the time, faded: tins and packets in a few muted colors. */
const LABELS = [0x8a3a2e, 0x3e5a6e, 0xb0823a, 0x56683e, 0xa89e86, 0x6e3e52, 0xb26a2a];

/** One shelf board of goods, `w` meters long: rows of tins, with a packet now and then. */
function stockShelf(kit: LevelKit, w: number, random: () => number): void {
  let x = -w / 2 + 0.06;
  while (x < w / 2 - 0.08) {
    const label = LABELS[Math.floor(random() * LABELS.length)]!;
    if (random() < 0.3) {
      const pw = 0.1 + random() * 0.08;
      kit.box({ w: pw, h: 0.18 + random() * 0.08, d: 0.07 }).color(label).at(x + pw / 2, 0, 0.02);
      x += pw + 0.02;
      continue;
    }
    const r = 0.035 + random() * 0.015;
    const h = 0.08 + random() * 0.06;
    const deep = random() < 0.6 ? 2 : 1;
    for (let row = 0; row < deep; row++) kit.cylinder({ r, h, sides: 6 }).color(label).at(x + r, 0, -0.06 + row * 0.12);
    x += r * 2 + 0.012;
  }
}

/** Uprights, a back, and boards stocked with goods. The back is on the -Z side. */
function shelving(kit: LevelKit, w: number, d: number, boards: number[], seed: number): void {
  const random = seededRandom(seed);
  const top = boards[boards.length - 1]! + 0.3;
  [-w / 2, w / 2].forEach((x) => kit.box({ w: 0.04, h: top, d }).color(DARK_WOOD).at(x, 0, 0));
  kit.box({ w, h: top, d: 0.02 }).texture('wood_planks', { tile: 1 }).color(0x4a3c2e).at(0, 0, -d / 2);
  boards.forEach((y, i) => {
    kit.box({ w, h: 0.025, d }).texture('wood_planks', { tile: 0.8 }).color(WOOD).at(0, y, 0);
    // The bottom board holds sacks and crates, not tins.
    if (i === 0) return;
    kit.group((g) => stockShelf(g, w, random)).at(0, y + 0.025, 0);
  });
}

export function buildShop(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  const look = (prompt: string, line: string, x: number, z: number, radius = 0.25) => kit.hotspot({ prompt, radius, onInteract: () => ctx.say(line) }).at(x, 0, z);
  const c = SHOP_COUNTER;
  const top = c.h;

  // The counter: a wooden front, a darker top worn pale where the customers lean.
  kit.box({ w: c.w, h: top - 0.04, d: c.d }).texture('wood_planks', { tile: 1.1 }).color(WOOD).at(c.x, 0, c.z).collider();
  kit.box({ w: c.w + 0.08, h: 0.04, d: c.d + 0.1 }).texture('wood_planks', { tile: 1.4 }).color(DARK_WOOD).at(c.x, top - 0.04, c.z);

  // Bread in a basket under a cloth, at the left end. By night the basket is empty.
  const breadX = c.x - 0.95;
  kit.box({ w: 0.5, h: 0.1, d: 0.34 }).color(0x7a5e34).at(breadX, top, c.z);
  if (!night) {
    [-0.12, 0.02, 0.15].forEach((dx, i) => kit.box({ w: 0.26, h: 0.11, d: 0.12 }).color(i === 1 ? 0x9a6a36 : 0x8a5a2c).at(breadX + dx * 0.4, top + 0.08, c.z - 0.08 + i * 0.08).rotY(70 + i * 12));
  }
  kit.box({ w: 0.32, h: 0.01, d: 0.3 }).color(0xb4ae9c).at(breadX + 0.08, top + (night ? 0.1 : 0.19), c.z + 0.03).rotY(8);

  // A wheel of Gruyère on its board, a wedge already sold. She puts it away at night.
  const cheeseX = c.x - 0.52;
  if (!night) {
    kit.box({ w: 0.48, h: 0.03, d: 0.36 }).texture('wood_planks', { tile: 0.5 }).color(0x9a8462).at(cheeseX, top, c.z);
    kit.cylinder({ r: 0.19, h: 0.09, sides: 10 }).color(0xbea05e).at(cheeseX - 0.03, top + 0.03, c.z);
    kit.box({ w: 0.14, h: 0.08, d: 0.08 }).color(0xc8ae6c).at(cheeseX + 0.17, top + 0.03, c.z + 0.08).rotY(25);
  }

  // The till, then the batteries and cigarettes at the right end, where she can reach them.
  const tillX = c.x + 0.33;
  kit.box({ w: 0.38, h: 0.16, d: 0.32 }).color(0x5c5a52).at(tillX, top, c.z - 0.05);
  kit.box({ w: 0.34, h: 0.08, d: 0.16 }).color(0x46443e).at(tillX, top + 0.16, c.z - 0.1);
  kit.box({ w: 0.12, h: 0.04, d: 0.02 }).color(0x2a3426).emissive(night ? 0x000000 : 0x1a2a10).at(tillX, top + 0.2, c.z - 0.19);
  const rackX = c.x + 1;
  kit.box({ w: 0.36, h: 0.42, d: 0.16 }).color(DARK_WOOD).at(rackX, top, c.z - 0.12);
  const packs = [0xb04034, 0x3a4c86, 0x7a9ab4, 0xc8c2b0, 0x3e5c3e];
  [0.08, 0.2, 0.32].forEach((y, row) =>
    [-0.12, -0.04, 0.04, 0.12].forEach((dx, i) => kit.box({ w: 0.06, h: 0.09, d: 0.03 }).color(packs[(row + i) % packs.length]!).at(rackX + dx, top + y, c.z - 0.03)),
  );
  const cardX = c.x + 0.68;
  kit.box({ w: 0.03, h: 0.32, d: 0.03 }).color(DARK_WOOD).at(cardX, top, c.z - 0.05);
  kit.box({ w: 0.2, h: 0.26, d: 0.01 }).color(0xa08a3a).at(cardX, top + 0.1, c.z - 0.03);
  [-0.05, 0.05].forEach((dx) => [0.16, 0.24].forEach((y) => kit.box({ w: 0.05, h: 0.06, d: 0.025 }).color(0x2a2a30).at(cardX + dx, top + y, c.z - 0.015)));

  // One hotspot at each end of the counter, so the middle stays clear for talking to Christine.
  look(
    night ? 'Look at the basket' : 'Look at the bread and cheese',
    night ? 'The bread basket is empty, the cloth folded on top.' : 'Two loaves under a cloth, and a Gruyère with a wedge cut out. It smells of the cellar.',
    c.x - 0.9,
    c.z + 0.1,
  );
  look('Look at the cigarettes', 'Parisienne, Marlboro, Brunette, kept where only she can reach. Batteries on a card beside them. Leclanché, made in Yverdon.', c.x + 0.9, c.z + 0.1);

  // Behind the counter: shelves of cigarette cartons, jars, and the radio, with the clock above.
  kit.group((g) => shelving(g, 2.6, 0.32, [0.25, 0.75, 1.2, 1.62], 31)).at(c.x - 0.05, 0, ROOM.z0 + WALL / 2 + 0.17);
  kit.box({ w: 0.3, h: 0.17, d: 0.12 }).color(0x5a4430).at(RADIO.x, RADIO.y - 0.08, RADIO.z);
  kit.box({ w: 0.12, h: 0.1, d: 0.01 }).color(0x2a2620).at(RADIO.x - 0.06, RADIO.y - 0.04, RADIO.z + 0.06);
  const wallFace = ROOM.z0 + WALL / 2;
  kit.mesh(new CylinderGeometry(0.17, 0.17, 0.05, 12).rotateX(Math.PI / 2)).color(0x3a3028).at(CLOCK.x, CLOCK.y, wallFace + 0.025);
  kit.mesh(new CylinderGeometry(0.145, 0.145, 0.02, 12).rotateX(Math.PI / 2)).color(0xd2cab4).at(CLOCK.x, CLOCK.y, wallFace + 0.05);
  kit.box({ w: 0.012, h: 0.1, d: 0.01 }).color(0x1a1a1a).at(CLOCK.x, CLOCK.y, wallFace + 0.065);
  kit.box({ w: 0.09, h: 0.012, d: 0.01 }).color(0x1a1a1a).at(CLOCK.x - 0.045, CLOCK.y, wallFace + 0.065);
  // A dairy calendar, still on November.
  kit.box({ w: 0.32, h: 0.46, d: 0.01 }).color(0xc4bca6).at(-0.15, 1.35, wallFace + 0.01);
  kit.box({ w: 0.28, h: 0.17, d: 0.012 }).color(0x5e6e4e).at(-0.15, 1.6, wallFace + 0.012);

  // The tinned goods along the east wall.
  const east = ROOM.x1 - WALL / 2 - 0.2;
  kit.group((g) => shelving(g, 2.8, 0.36, [0.12, 0.55, 0.98, 1.4, 1.8], 7)).at(east, 0, 0.85).rotY(-90);
  kit.barrier({ w: 0.4, d: 2.8 }).at(east, 0, 0.85);
  [0.2, 0.9, 1.6].forEach((z, i) => kit.box({ w: 0.3, h: 0.1, d: 0.4 }).color(i === 1 ? 0x8a7a5a : 0x7a6a4c).at(east, 0.14, z));
  look('Look at the shelves', 'Tinned peas, ravioli, condensed milk, Ovomaltine. Only the ravioli has no dust on it.', east - 0.3, 0.85, 0.6);

  // The cork board by the door.
  const boardZ = ROOM.z1 - WALL / 2 - 0.02;
  const b = CORK_BOARD;
  kit.box({ w: b.w + 0.05, h: b.h + 0.05, d: 0.02 }).color(DARK_WOOD).at(b.x, b.y - 0.025, boardZ);
  kit.box({ w: b.w, h: b.h, d: 0.03 }).color(0x8e6c44).at(b.x, b.y, boardZ - 0.005);
  const notices: [x: number, y: number, w: number, h: number, color: number][] = [
    [-0.2, 0.33, 0.2, 0.15, 0xd6d0bc],
    [0.04, 0.36, 0.17, 0.13, 0xc8c87e],
    [0.24, 0.3, 0.14, 0.2, 0xd2ccb6],
    [-0.18, 0.1, 0.22, 0.16, 0xd8d2be],
    [0.07, 0.12, 0.14, 0.11, 0xb8c4c8],
    [0.25, 0.08, 0.12, 0.12, 0xd8a8a0],
  ];
  notices.forEach(([x, y, w, h, color]) => {
    kit.box({ w, h, d: 0.005 }).color(color).at(b.x + x, b.y + y - h / 2 + 0.06, boardZ - 0.025);
    kit.box({ w: 0.015, h: 0.015, d: 0.01 }).color(LABELS[Math.round(x * 10 + y * 10 + 10) % LABELS.length]!).at(b.x + x, b.y + y + 0.035, boardZ - 0.03);
  });
  kit.hotspot({ prompt: 'Read the notices', radius: 0.35, onInteract: () => readDocument(ctx, 'doc_laiterie_board') }).at(b.x, 0, boardZ - 0.2);

  // The brass bell on its spring over the door.
  kit.box({ w: 0.03, h: 0.03, d: 0.16 }).color(0x2a2620).at(BELL.x, BELL.y + 0.12, BELL.z + 0.06);
  kit.cylinder({ r: 0.012, h: 0.1, sides: 4 }).color(0x6a6458).at(BELL.x, BELL.y + 0.04, BELL.z - 0.02);
  kit.cylinder({ r: 0.05, h: 0.07, sides: 8 }).color(0x9a7a34).at(BELL.x, BELL.y - 0.03, BELL.z - 0.02);
}
