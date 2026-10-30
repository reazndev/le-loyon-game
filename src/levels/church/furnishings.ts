import { hashString, seededRandom } from '../../engine/random';
import type { LevelKit } from '../../game/kit/levelKit';
import { CHANCEL, NAVE, PEW, PEW_ROWS, RAISED, SIDE_ALTAR, WALL } from './layout';

/**
 * What a parish leaves lying about between masses: the hymn boards still showing Sunday's numbers,
 * chrysanthemums from All Saints going brown on the altar steps, hymnals stacked by the door, a
 * poor box, prayer books left on the pews, and two prie-dieux from Saturday's funeral nobody has
 * put away. All still, for the nave's batch.
 */
export function furnish(kit: LevelKit): void {
  const north = NAVE.z0 + WALL / 2 + 0.03;
  [-1, 1].forEach((side) => hymnBoard(kit, side * 4.25, north));
  [-2.9, 2.9].forEach((x, i) => vase(kit, x, RAISED / 2, CHANCEL.z1 + 0.2, 1, i));
  const altarTop = RAISED + 0.15 + 1.01;
  [-0.5, 0.5].forEach((x, i) => vase(kit, x, altarTop, CHANCEL.z0 + 1.6 - 0.05, 0.7, i + 2));
  [-0.55, 0.55].forEach((dz, i) => vase(kit, SIDE_ALTAR.x, 0.98, SIDE_ALTAR.z + dz, 0.6, i + 4));
  hymnalTable(kit, 3.7, NAVE.z1 - WALL / 2 - 0.26);
  poorBox(kit, -2.4, NAVE.z1 - WALL / 2 - 0.2);
  prayerBooks(kit);
  [-1.45, -2.25].forEach((x) => prieDieu(kit, x, -9.5));
}

/** The hymns sung on Sunday, as the sacristan slotted them in. */
const HYMNS = ['312', '540', '87'];

/** Painted numerals as strokes: top, upper left, upper right, middle, lower left, lower right, bottom. */
const STROKES: Record<string, string> = {
  '0': 'tlrLRb',
  '1': 'rR',
  '2': 'trmLb',
  '3': 'trmRb',
  '4': 'lrmR',
  '5': 'tlmRb',
  '7': 'trR',
  '8': 'tlrmLRb',
};

/** A dark board with three white cards: the hymn numbers in dark strokes. */
function hymnBoard(kit: LevelKit, x: number, face: number): void {
  const ink = 0x221e1a;
  kit
    .group((g) => {
      g.box({ w: 0.5, h: 0.86, d: 0.04 }).texture('pew_wood', { tile: 0.8 }).color(0x3a2e26);
      g.box({ w: 0.36, h: 0.08, d: 0.06 }).texture('pew_wood', { tile: 0.8 }).color(0x4a3c30).at(0, 0.86, 0.01);
      [0.6, 0.34, 0.08].forEach((y, card) => {
        g.box({ w: 0.4, h: 0.18, d: 0.01 }).color(0xd2ccbc).at(0, y, 0.025);
        const number = HYMNS[card]!;
        [...number].forEach((digit, i) => {
          const cx = (i - (number.length - 1) / 2) * 0.09;
          const [w, h, z] = [0.04, 0.055, 0.031];
          const bar = (dy: number) => g.box({ w, h: 0.012, d: 0.005 }).color(ink).at(cx, y + 0.03 + dy, z);
          const post = (dx: number, dy: number) => g.box({ w: 0.012, h, d: 0.005 }).color(ink).at(cx + dx, y + 0.03 + dy, z);
          [...STROKES[digit]!].forEach((stroke) => {
            if (stroke === 't') bar(2 * h);
            if (stroke === 'm') bar(h);
            if (stroke === 'b') bar(0);
            if (stroke === 'l') post(-w / 2, h);
            if (stroke === 'r') post(w / 2, h);
            if (stroke === 'L') post(-w / 2, 0);
            if (stroke === 'R') post(w / 2, 0);
          });
        });
      });
    })
    .at(x, 1.85, face + 0.02);
}

/** A brass vase of chrysanthemums, mostly brown now; `scale` 1 stands on a step, smaller on an altar. */
function vase(kit: LevelKit, x: number, y: number, z: number, scale: number, seed: number): void {
  const random = seededRandom(hashString(`church-vase-${seed}`));
  const blooms = [0xb8ac88, 0x8a6e4a, 0x7a5e44, 0xc8c0a8, 0x6e5440];
  const placed = kit
    .group((g) => {
      g.cylinder({ r: 0.07, h: 0.04, sides: 6 }).color(0x7a6a40).at(0, 0, 0);
      g.cylinder({ r: 0.055, h: 0.3, sides: 6 }).color(0x8c7a4c).at(0, 0.04, 0);
      g.cylinder({ r: 0.075, h: 0.04, sides: 6 }).color(0x8c7a4c).at(0, 0.32, 0);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + random();
        const r = 0.04 + random() * 0.07;
        const h = 0.38 + random() * 0.14;
        g.box({ w: 0.012, h: h - 0.32, d: 0.012 }).color(0x4a4a30).at(Math.cos(a) * r * 0.5, 0.32, Math.sin(a) * r * 0.5);
        g.box({ w: 0.07, h: 0.05, d: 0.07 }).color(blooms[Math.floor(random() * blooms.length)]!).at(Math.cos(a) * r, h, Math.sin(a) * r).rotY(random() * 90);
      }
      // A dropped head on the stone.
      g.box({ w: 0.06, h: 0.03, d: 0.06 }).color(0x6a5040).at(0.14, 0, 0.08).rotY(25);
    })
    .at(x, y, z)
    .rotY(seed * 47);
  placed.object.scale.setScalar(scale);
}

/** A small table against the back wall with hymnals stacked on it and one lying open. */
function hymnalTable(kit: LevelKit, x: number, z: number): void {
  kit.box({ w: 1.1, h: 0.04, d: 0.48 }).texture('pew_wood', { tile: 1 }).color(0x8a7866).at(x, 0.76, z).collider();
  [
    [-0.5, -0.2],
    [0.5, -0.2],
    [-0.5, 0.2],
    [0.5, 0.2],
  ].forEach(([dx, dz]) => kit.box({ w: 0.05, h: 0.76, d: 0.05 }).color(0x6a5a4c).at(x + dx!, 0, z + dz!));
  const covers = [0x2a2a3a, 0x30282a, 0x2a2a3a, 0x3a3226];
  [-0.32, -0.08, 0.16].forEach((dx, stack) => {
    const count = 6 - stack * 2;
    for (let i = 0; i < count; i++) {
      kit
        .box({ w: 0.13, h: 0.032, d: 0.19 })
        .color(covers[(i + stack) % covers.length]!)
        .at(x + dx + ((i * 7) % 3) * 0.004, 0.8 + i * 0.032, z)
        .rotY(((i * 13) % 7) - 3);
    }
  });
  // One open, face up, its pages pale.
  kit.box({ w: 0.26, h: 0.012, d: 0.19 }).color(0xc8c2b0).at(x + 0.4, 0.8, z + 0.02).rotY(-8);
  kit.box({ w: 0.005, h: 0.014, d: 0.19 }).color(0x6a6458).at(x + 0.4, 0.8, z + 0.02).rotY(-8);
}

/** The iron poor box on a wooden post by the door: "Pour les pauvres", the slot worn bright. */
function poorBox(kit: LevelKit, x: number, z: number): void {
  kit.box({ w: 0.12, h: 0.92, d: 0.12 }).texture('pew_wood', { tile: 0.6 }).color(0x4a3c32).at(x, 0, z);
  kit.box({ w: 0.24, h: 0.2, d: 0.18 }).texture('rust_metal', { tile: 0.4 }).color(0x3a3634).at(x, 0.92, z);
  kit.box({ w: 0.1, h: 0.01, d: 0.02 }).color(0x8a8070).at(x, 1.121, z - 0.02);
  kit.box({ w: 0.04, h: 0.05, d: 0.01 }).color(0x8c7a4c).at(x, 0.98, z - 0.091);
  kit.box({ w: 0.16, h: 0.05, d: 0.005 }).color(0xb8b2a2).at(x, 1.05, z - 0.093);
}

/** Missals and rosaries left where people sat, the same few places every week. */
function prayerBooks(kit: LevelKit): void {
  const random = seededRandom(hashString('church-pew-books'));
  const seat = 0.48;
  const covers = [0x1e1a18, 0x2a2420, 0x3a2622, 0x22262e];
  for (let row = 0; row < PEW_ROWS; row++) {
    [-1, 1].forEach((side) => {
      if (random() > 0.32) return;
      const x = side * PEW.x + (random() - 0.5) * (PEW.w - 0.6);
      const z = PEW.firstZ - row * PEW.spacing + 0.02;
      const yaw = (random() - 0.5) * 40;
      kit.box({ w: 0.11, h: 0.028, d: 0.16 }).color(covers[Math.floor(random() * covers.length)]!).at(x, seat, z).rotY(yaw);
      if (random() < 0.35) {
        // A rosary on the cover, as a short run of beads.
        for (let i = 0; i < 5; i++) kit.box({ w: 0.012, h: 0.012, d: 0.012 }).color(0x2a2018).at(x - 0.04 + i * 0.02, seat + 0.03, z + Math.sin(i) * 0.02);
      }
    });
  }
}

/** A prie-dieu facing the altar: a sloped rest on a frame and a padded step for the knees. */
function prieDieu(kit: LevelKit, x: number, z: number): void {
  kit
    .group((g) => {
      g.box({ w: 0.48, h: 0.06, d: 0.24 }).texture('pew_wood', { tile: 0.6 }).color(0x5e4e42).at(0, 0.82, -0.18);
      g.box({ w: 0.48, h: 0.8, d: 0.04 }).texture('pew_wood', { tile: 0.8 }).color(0x544438).at(0, 0, -0.22);
      g.box({ w: 0.44, h: 0.1, d: 0.22 }).color(0x5a2a2a).at(0, 0, 0.06);
      [-0.22, 0.22].forEach((dx) => g.box({ w: 0.04, h: 0.1, d: 0.3 }).color(0x4a3c32).at(dx, 0, 0.0));
    })
    .at(x, 0, z);
  kit.barrier({ w: 0.5, d: 0.45 }).at(x, 0, z - 0.05);
}
