import { BoxGeometry, ConeGeometry } from 'three';
import { cylinderGeometry } from '../../engine/render/geometry';
import type { LightBuilder, MeshBuilder, Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { handText, paintedTexture } from '../forest_path/scrawl';
import { yawToward } from '../forest_path/trail';

/**
 * The things that make Leurs Swiss and lived in: the fountain, the phone box, the PostBus stop,
 * the memorial, the yellow hiking sign, the Fribourg flag, milk cans, a tractor, a bicycle.
 * Each returns a group with its origin on the ground; place it with `.at()` and `.rotY()`.
 */

const STONE = 0x9a9890;
const POSTBUS_YELLOW = 0xcfa62c;
const HIKING_YELLOW = 0xd2ac2a;

/** A wheel standing on its edge, its axle along X, its origin at the hub. */
export function wheel(kit: LevelKit, radius: number, width: number, color = 0x1e1d1c) {
  return kit
    .mesh(cylinderGeometry(radius, width, 10, 1).translate(0, -width / 2, 0).rotateZ(Math.PI / 2))
    .texture('rust_metal', { tile: 0.6 })
    .color(color);
}

/** The village fountain: a long stone basin, a column with a spout, water running. */
export function fountain(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 3.4, h: 0.72, d: 1.5 }).texture('stone_wall', { tile: 1.2 }).color(STONE).collider();
    // The rim stands proud of the water on all four sides.
    [
      [0, 0.7, 3.4, 0.16],
      [0, -0.7, 3.4, 0.16],
    ].forEach(([x, z, w, d]) => g.box({ w: w!, h: 0.1, d: d! }).texture('stone_wall', { tile: 1 }).color(0xa6a49c).at(x!, 0.72, z!));
    [-1.62, 1.62].forEach((x) => g.box({ w: 0.16, h: 0.1, d: 1.5 }).texture('stone_wall', { tile: 1 }).color(0xa6a49c).at(x, 0.72, 0));
    g.plane({ w: 3.1, d: 1.24, cell: 0.5 }).color(0x2a3134).emissive(0x0c0f10).at(0, 0.66, 0);
    // The column at one end, with a brass spout and the thin stream into the basin.
    g.cylinder({ r: 0.17, h: 1.6, sides: 8 }).texture('church_stone', { tile: 0.6 }).color(0xa4a29a).at(-1.95, 0, 0).collider();
    g.cylinder({ r: 0.22, h: 0.1, sides: 8 }).texture('church_stone', { tile: 0.6 }).color(0xa8a69e).at(-1.95, 1.6, 0);
    g.mesh(new ConeGeometry(0.12, 0.3, 8).translate(0, 0.15, 0)).color(0x9a988f).at(-1.95, 1.7, 0);
    g.box({ w: 0.42, h: 0.05, d: 0.05 }).texture('rust_metal', { tile: 0.3 }).color(0x6a5434).at(-1.55, 1.18, 0);
    g.box({ w: 0.035, h: 0.5, d: 0.035 }).color(0x4e5658).at(-1.36, 0.68, 0);
  });
}

/** A red phone box with a hood and glass on three sides, faded and streaked by twenty winters. */
export function phoneBox(kit: LevelKit) {
  return kit.group((g) => {
    const red = (size: { w: number; h: number; d: number }) => g.box(size).texture('rust_metal', { tile: 1.2 }).color(0xa8483c);
    g.box({ w: 1.05, h: 0.1, d: 1.05 }).texture('stone_wall', { tile: 1 }).color(0x8c8a84).walkable('stone');
    [-0.48, 0.48].forEach((x) => red({ w: 0.1, h: 2.3, d: 1.05 }).at(x, 0.1, 0).collider());
    red({ w: 1.05, h: 2.3, d: 0.1 }).at(0, 0.1, -0.48).collider();
    // Glass panes in the sides, dark with the inside.
    [-0.535, 0.535].forEach((x) => g.box({ w: 0.02, h: 1.3, d: 0.75 }).color(0x2c3236).at(x, 0.9, 0));
    g.box({ w: 0.75, h: 1.3, d: 0.02 }).color(0x2c3236).at(0, 0.9, -0.535);
    // The door, mostly glass in a red frame, on the front.
    red({ w: 0.86, h: 2.2, d: 0.05 }).at(0, 0.12, 0.5);
    g.box({ w: 0.66, h: 1.6, d: 0.02 }).color(0x353b3e).at(0, 0.5, 0.53);
    red({ w: 1.2, h: 0.2, d: 1.2 }).at(0, 2.4, 0);
    g.box({ w: 0.8, h: 0.13, d: 0.02 }).texture('plaster_wall', { tile: 0.8 }).color(0x8e8a7c).at(0, 2.43, 0.61);
    // Road dirt splashed up the foot of the box.
    g.box({ w: 1.08, h: 0.32, d: 1.08 }).texture('mud', { tile: 0.8 }).color(0x4a3c32).at(0, 0.1, 0);
    // The telephone on the back wall.
    g.box({ w: 0.26, h: 0.34, d: 0.12 }).color(0x4a4a48).at(0, 1.2, -0.38);
    g.box({ w: 0.06, h: 0.2, d: 0.06 }).color(0x1a1a1a).at(-0.1, 1.34, -0.3);
  });
}

/** A PostBus stop: the yellow sign with the horn, the timetable, and a wooden shelter with a bench. */
export function busStop(kit: LevelKit) {
  return kit.group((g) => {
    g.cylinder({ r: 0.04, h: 2.5, sides: 6 }).color(0x6a6a68).at(1.6, 0, 0.6).collider();
    g.box({ w: 0.62, h: 0.42, d: 0.03 }).color(POSTBUS_YELLOW).at(1.6, 2.1, 0.6);
    g.box({ w: 0.26, h: 0.12, d: 0.035 }).color(0x1c1a16).at(1.6, 2.25, 0.6);
    g.box({ w: 0.08, h: 0.08, d: 0.035 }).color(0x1c1a16).at(1.5, 2.18, 0.6);
    g.box({ w: 0.5, h: 0.05, d: 0.035 }).color(0x1c1a16).at(1.6, 2.15, 0.6);
    g.box({ w: 0.38, h: 0.5, d: 0.04 }).map(timetablePaper(), { tile: [0.38, 0.5] }).color(0xc8c4b4).at(1.6, 1.3, 0.62);
    // The shelter: three plank walls, a shingled roof, a bench.
    g.box({ w: 2.6, h: 2.2, d: 0.1 }).texture('wood_planks', { tile: 1.5 }).color(0x7a6a5a).at(-0.3, 0, -0.75).collider();
    [-1.55, 0.95].forEach((x) => g.box({ w: 0.1, h: 2.2, d: 1.5 }).texture('wood_planks', { tile: 1.5 }).color(0x726252).at(x, 0, 0).collider());
    g.box({ w: 2.9, h: 0.12, d: 1.9 }).texture('roof_shingles', { tile: 1 }).color(0x5a5652).at(-0.3, 2.2, 0.05);
    g.box({ w: 2.3, h: 0.06, d: 0.4 }).texture('wood_planks', { tile: 1 }).color(0x8a7a66).at(-0.3, 0.45, -0.5);
    [-1.2, 0.6].forEach((x) => g.box({ w: 0.06, h: 0.45, d: 0.06 }).color(0x4a4440).at(x, 0, -0.5));
  });
}

/** The 1914-18 memorial: a stone with a bronze plaque and a little iron rail. */
export function memorial(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 1.3, h: 0.25, d: 0.8 }).texture('stone_wall', { tile: 1 }).color(0x8e8c86).walkable('stone');
    g.box({ w: 0.9, h: 1.55, d: 0.38 }).texture('church_stone', { tile: 1 }).color(0xa4a29c).at(0, 0.25, -0.1).collider();
    g.box({ w: 0.6, h: 0.42, d: 0.03 }).color(0x4e5040).emissive(0x0a0c08).at(0, 1.0, 0.1);
    g.box({ w: 0.5, h: 0.04, d: 0.032 }).color(0x8a8458).at(0, 1.3, 0.1);
    g.box({ w: 0.04, h: 0.4, d: 0.04 }).color(0x2a2a28).at(-0.6, 0.25, 0.35);
    g.box({ w: 0.04, h: 0.4, d: 0.04 }).color(0x2a2a28).at(0.6, 0.25, 0.35);
    g.box({ w: 1.24, h: 0.03, d: 0.03 }).color(0x2a2a28).at(0, 0.62, 0.35);
  });
}

export interface StreetLamp {
  post: Placed;
  /** What the flicker drives at night; null by day, when the lamp is off. */
  lit: { bulb: MeshBuilder; glow: MeshBuilder; light: LightBuilder } | null;
}

/** How far the lamp head reaches out from the post, along the lamp's local +Z. */
export const LAMP_HEAD = { y: 4.3, reach: 0.85 };

/** The single street lamp on the square. At night a ball of orange light in the fog. */
export function streetLamp(kit: LevelKit, lit: boolean): StreetLamp {
  let parts: StreetLamp['lit'] = null;
  const post = kit.group((g) => {
    g.cylinder({ r: 0.07, h: 4.6, sides: 6 }).color(0x3a3c3c).collider();
    g.box({ w: 0.05, h: 0.05, d: 0.9 }).color(0x3a3c3c).at(0, 4.5, 0.42);
    g.box({ w: 0.36, h: 0.14, d: 0.5 }).color(0x4a4c4c).at(0, 4.36, LAMP_HEAD.reach);
    const bulb = g.box({ w: 0.28, h: 0.06, d: 0.4 }).at(0, 4.32, LAMP_HEAD.reach);
    if (!lit) {
      bulb.color(0x6a6a64);
      return;
    }
    parts = {
      bulb: bulb.unlit().color(0xffb860).dynamic(),
      glow: g.glow(4.2, 0xff9a40).at(0, 4.15, LAMP_HEAD.reach),
      light: g.light({ color: 0xff9a48, intensity: 3.4, range: 13 }).at(0, 3.9, LAMP_HEAD.reach),
    };
  });
  return { post, lit: parts };
}

/** The Fribourg flag on a pole, black over white, hanging limp in the wet air. */
export function fribourgFlag(kit: LevelKit) {
  return kit.group((g) => {
    g.cylinder({ r: 0.05, h: 7, sides: 6 }).color(0xb0aea6).collider();
    g.box({ w: 0.12, h: 0.12, d: 0.12 }).color(0xa08a50).at(0, 7, 0);
    // A limp flag hangs as a long banner: the black half on the hoist side, the white half out.
    g.box({ w: 0.5, h: 1.9, d: 0.02 }).color(0x161616).at(0.3, 4.95, 0).doubleSided();
    // Grey with rain, not white, so at night it doesn't hang in the dark like a sign.
    g.box({ w: 0.5, h: 1.75, d: 0.02 }).texture('plaster_wall', { tile: 1 }).color(0x7c7a72).at(0.8, 5.1, 0.03).rotY(-12).doubleSided();
  });
}

/** A yellow hiking signpost with two arrows, the Swiss Wanderweg sign. */
export function hikingSign(kit: LevelKit, arrows: [number, number]) {
  return kit.group((g) => {
    g.box({ w: 0.1, h: 2.5, d: 0.1 }).color(0x8a8a84).collider();
    arrows.forEach((yaw, i) =>
      g
        .group((a) => {
          a.box({ w: 0.92, h: 0.19, d: 0.025 }).color(HIKING_YELLOW).at(0.5, 0, 0);
          a.box({ w: 0.6, h: 0.03, d: 0.03 }).color(0x1c1a14).at(0.42, 0.1, 0);
          a.box({ w: 0.32, h: 0.03, d: 0.03 }).color(0x1c1a14).at(0.3, 0.05, 0);
        })
        .at(0, 2.1 - i * 0.26, 0)
        .rotY(yaw),
    );
    g.box({ w: 0.28, h: 0.2, d: 0.025 }).color(0xc8c4b4).at(0, 2.42, 0.06);
  });
}

/** An aluminium milk can with its lid. */
export function milkCan(kit: LevelKit, tilt = 0) {
  return kit.group((g) => {
    g.cylinder({ r: 0.17, h: 0.52, sides: 8 }).color(0xa6a8a6).collider();
    g.cylinder({ r: 0.1, h: 0.12, sides: 8 }).color(0x9a9c9a).at(0, 0.52, 0);
    g.cylinder({ r: 0.13, h: 0.04, sides: 8 }).color(0xb2b4b2).at(0, 0.64, 0);
  }).rotY(tilt);
}

/** An old red tractor, cabless, with big ribbed rear wheels and mud up the fenders. */
export function tractor(kit: LevelKit) {
  const body = 0x7a3c32;
  return kit.group((g) => {
    g.box({ w: 0.75, h: 0.72, d: 1.7 }).texture('rust_metal', { tile: 1 }).color(body).at(0, 0.62, 0.55).collider();
    g.box({ w: 0.9, h: 0.5, d: 1.0 }).texture('rust_metal', { tile: 1 }).color(0x5a5048).at(0, 0.55, -0.7).collider();
    g.box({ w: 0.78, h: 0.1, d: 0.9 }).color(0x6a2e26).at(0, 1.34, 0.6);
    [-1, 1].forEach((side) => {
      wheel(g, 0.62, 0.32).at(side * 0.78, 0.62, -0.8);
      wheel(g, 0.34, 0.18).at(side * 0.55, 0.34, 1.05);
      g.box({ w: 0.36, h: 0.06, d: 1.1 }).color(0x5a3a30).at(side * 0.78, 1.26, -0.8);
    });
    g.box({ w: 0.46, h: 0.08, d: 0.4 }).color(0x2a2a28).at(0, 1.1, -0.9);
    g.box({ w: 0.42, h: 0.4, d: 0.06 }).color(0x2a2a28).at(0, 1.14, -1.12);
    g.cylinder({ r: 0.05, h: 0.8, sides: 5 }).color(0x2a2826).at(0.24, 1.3, 1.0);
    g.box({ w: 0.12, h: 0.36, d: 0.04 }).color(0x2a2826).at(0, 1.14, -0.25);
  });
}

/** A bicycle, standing or lying on its side. Size 1 is a child's; 1.35 is a grown-up's black roadster. */
export function bicycle(kit: LevelKit, { size = 1, frame = 0x8a2a2a }: { size?: number; frame?: number } = {}) {
  const s = size;
  return kit.group((g) => {
    wheel(g, 0.25 * s, 0.04, 0x1a1a1a).at(0, 0.25 * s, 0.45 * s).rotY(90);
    wheel(g, 0.25 * s, 0.04, 0x1a1a1a).at(0, 0.25 * s, -0.45 * s).rotY(90);
    g.box({ w: 0.04, h: 0.04, d: 0.8 * s }).color(frame).at(0, 0.5 * s, 0);
    g.box({ w: 0.04, h: 0.3 * s, d: 0.04 }).color(frame).at(0, 0.25 * s, -0.1 * s);
    g.box({ w: 0.1, h: 0.04, d: 0.2 * s }).color(0x1a1a1a).at(0, 0.6 * s, -0.12 * s);
    g.box({ w: 0.4 * s, h: 0.03, d: 0.03 }).color(0x6a6a6a).at(0, 0.68 * s, 0.42 * s);
    g.box({ w: 0.03, h: 0.2 * s, d: 0.03 }).color(frame).at(0, 0.5 * s, 0.42 * s);
  });
}

/**
 * A Fiat Panda, the first one: a box on wheels with flat glass all round, grey plastic bumpers
 * and side strips, square lamps, and road dirt up the sills. Its front faces +Z.
 */
export function smallCar(kit: LevelKit, color = 0x8e8a7a) {
  const glass = 0x22272a;
  const plastic = 0x3a3a38;
  return kit.group((g) => {
    g.box({ w: 1.5, h: 0.6, d: 3.4 }).color(color).at(0, 0.2, 0).collider();
    // The dark under the floor, so the body sits on its wheels instead of hovering.
    g.box({ w: 1.36, h: 0.16, d: 3.1 }).color(0x0e0e0e).at(0, 0.05, 0);
    // The glasshouse: pillars in the body color behind dark panes that stand a little proud of it.
    g.box({ w: 1.38, h: 0.56, d: 2.05 }).color(color).at(0, 0.8, -0.38);
    g.box({ w: 1.41, h: 0.4, d: 1.78 }).color(glass).at(0, 0.9, -0.38);
    g.box({ w: 1.2, h: 0.4, d: 2.08 }).color(glass).at(0, 0.9, -0.38);
    g.box({ w: 0.04, h: 0.42, d: 0.05 }).color(color).at(-0.71, 0.89, -0.28);
    g.box({ w: 0.04, h: 0.42, d: 0.05 }).color(color).at(0.71, 0.89, -0.28);
    g.box({ w: 1.3, h: 0.04, d: 1.8 }).color(plastic).at(0, 1.36, -0.4);
    [1, -1].forEach((end) => g.box({ w: 1.54, h: 0.17, d: 0.12 }).color(plastic).at(0, 0.16, end * 1.72));
    [-1, 1].forEach((side) => {
      g.box({ w: 0.03, h: 0.13, d: 2.1 }).color(plastic).at(side * 0.775, 0.25, 0);
      wheel(g, 0.27, 0.15, 0x161616).at(side * 0.7, 0.27, 1.08);
      wheel(g, 0.27, 0.15, 0x161616).at(side * 0.7, 0.27, -1.12);
      g.box({ w: 0.3, h: 0.18, d: 0.03 }).color(0xb8b4a0).at(side * 0.48, 0.5, 1.71);
      g.box({ w: 0.22, h: 0.14, d: 0.03 }).color(0x5a2420).at(side * 0.55, 0.54, -1.71);
    });
    g.box({ w: 0.6, h: 0.14, d: 0.03 }).color(0x1c1c1c).at(0, 0.52, 1.71);
    g.box({ w: 1.52, h: 0.14, d: 3.42 }).texture('mud', { tile: 0.8 }).color(0x4a3e34).at(0, 0.18, 0);
  });
}

/** A park bench of slats on concrete feet. */
export function bench(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 1.8, h: 0.06, d: 0.42 }).texture('wood_planks', { tile: 1 }).color(0x7a6a58).at(0, 0.44, 0).collider();
    g.box({ w: 1.8, h: 0.4, d: 0.05 }).texture('wood_planks', { tile: 1 }).color(0x726252).at(0, 0.58, -0.2);
    [-0.75, 0.75].forEach((x) => g.box({ w: 0.08, h: 0.44, d: 0.4 }).color(0x8a8880).at(x, 0, 0));
  });
}

/** The commune's notice case on two posts: a glass front over pinned papers. */
export function noticeCase(kit: LevelKit) {
  return kit.group((g) => {
    [-0.55, 0.55].forEach((x) => g.box({ w: 0.08, h: 1.9, d: 0.08 }).color(0x5a5048).at(x, 0, 0).collider());
    g.box({ w: 1.3, h: 0.9, d: 0.12 }).texture('wood_planks', { tile: 1 }).color(0x6a5a4a).at(0, 1.0, 0);
    g.box({ w: 1.18, h: 0.78, d: 0.01 }).map(noticePapers(), { tile: [1.18, 0.78] }).color(0xb8b4a8).at(0, 1.06, 0.065);
    g.box({ w: 1.4, h: 0.08, d: 0.22 }).color(0x4a4038).at(0, 1.9, 0);
  });
}

/**
 * What is pinned up behind the glass: the commune's notice of the assembly, a cattle auction, the
 * choir, a loto, and a lost cat with its photo.
 */
function noticePapers() {
  return paintedTexture([96, 64], (c) => {
    c.fillStyle = '#4a3e32';
    c.fillRect(0, 0, 96, 64);
    const paper = (x: number, y: number, w: number, h: number, tone: string, title: string, lines: number) => {
      c.fillStyle = tone;
      c.fillRect(x, y, w, h);
      c.fillStyle = '#d8d0b8';
      c.fillRect(x + w / 2 - 1, y, 2, 2);
      handText(c, title, x + 2, y + 5, { size: 5, color: '#2a2620', font: 'serif' });
      c.fillStyle = '#6a645a';
      for (let i = 0; i < lines; i++) c.fillRect(x + 2, y + 10 + i * 3, w - 4 - ((i * 5) % 7), 1);
    };
    paper(3, 3, 30, 36, '#cfcabb', 'COMMUNE', 8);
    paper(37, 5, 28, 22, '#b8ae8a', 'Bétail', 4);
    paper(68, 3, 25, 28, '#c4c0b2', 'Chœur', 5);
    paper(40, 32, 30, 28, '#cac6b8', 'Chat perdu', 3);
    // The lost cat's photocopied photo, a grey smudge.
    c.fillStyle = '#5a5854';
    c.fillRect(44, 44, 10, 8);
    paper(6, 43, 26, 18, '#a8a490', 'Loto', 3);
  });
}

/** The PostBus timetable: the yellow band with the stop's name, columns of departures under it. */
function timetablePaper() {
  return paintedTexture([24, 32], (c) => {
    c.fillStyle = '#d4d0c0';
    c.fillRect(0, 0, 24, 32);
    c.fillStyle = '#c8a030';
    c.fillRect(0, 0, 24, 5);
    c.fillStyle = '#2a2620';
    c.fillRect(2, 2, 10, 1);
    for (let row = 0; row < 9; row++) {
      [2, 9, 16].forEach((x, col) => {
        if ((row * 3 + col) % 7 !== 5) c.fillRect(x, 8 + row * 2.5, 5, 1);
      });
    }
  });
}

/** A pile of old tyres outside the garage. */
export function tyres(kit: LevelKit, count: number) {
  return kit.group((g) => {
    for (let i = 0; i < count; i++) g.cylinder({ r: 0.32, h: 0.2, sides: 8 }).color(0x1c1c1c).at(i % 2 ? 0.04 : 0, i * 0.2, 0).collider();
  });
}

/**
 * The commune's own signpost, older than the yellow hiking signs: a wooden post with arms
 * hand-lettered in white. Each arm points toward a spot; its board runs along local -Z.
 */
export function signpost(kit: LevelKit, at: { x: number; z: number }, arms: { label: string; toward: { x: number; z: number } }[]) {
  return kit.group((g) => {
    g.box({ w: 0.11, h: 2.6, d: 0.11 }).texture('wood_planks', { tile: 0.8 }).color(0x5e5244).collider();
    g.mesh(new ConeGeometry(0.1, 0.14, 4).rotateY(Math.PI / 4).translate(0, 2.67, 0)).texture('wood_planks', { tile: 0.5 }).color(0x4a4036);
    arms.forEach(({ label, toward }, i) => {
      const board = { length: 0.95, h: 0.17 };
      g.group((a) => {
        a.box({ w: 0.03, h: board.h, d: board.length }).map(paintedBoard(label), { tile: [board.length, board.h] }).at(0, 0, -board.length / 2 - 0.04);
        a.mesh(new BoxGeometry(0.03, board.h / Math.SQRT2, board.h / Math.SQRT2).rotateX(Math.PI / 4).translate(0, board.h / 2, -board.length - 0.04))
          .texture('wood_planks', { tile: 0.5 })
          .color(0x6a5c4c);
      })
        .at(0, 2.25 - i * 0.24, 0)
        .rotY(yawToward(toward.x - at.x, toward.z - at.z));
    });
  }).at(at.x, 0, at.z);
}

/** Weathered boards with the place name brushed on in off-white, the tip end on the right. */
function paintedBoard(label: string) {
  return paintedTexture([96, 17], (c) => {
    c.fillStyle = '#5c4e3e';
    c.fillRect(0, 0, 96, 17);
    c.fillStyle = '#4c4034';
    [3, 9, 14].forEach((y) => c.fillRect(0, y, 96, 1));
    handText(c, label, 6, 9, { size: 12, color: '#c4bca6', font: 'serif' });
  });
}

/**
 * A wayside cross under a little roof, the kind every road out of a Fribourg village has. Tall
 * and dark, it marks the road south from the square at the edge of the fog.
 */
export function waysideCross(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 0.7, h: 0.4, d: 0.7 }).texture('stone_wall', { tile: 1 }).color(0x7e7c76).collider();
    g.box({ w: 0.16, h: 3.4, d: 0.14 }).texture('wood_planks', { tile: 0.8 }).color(0x4a3e34).at(0, 0.4, 0);
    g.box({ w: 1.3, h: 0.14, d: 0.12 }).texture('wood_planks', { tile: 0.8 }).color(0x4a3e34).at(0, 2.9, 0);
    g.gable({ w: 1.6, d: 0.5, h: 0.3 }).texture('roof_shingles', { tile: 0.6 }).color(0x4a4642).doubleSided().at(0, 3.7, 0);
    // The figure, a small pale shape on the dark wood, worn smooth.
    g.box({ w: 0.12, h: 0.5, d: 0.05 }).color(0x8a8478).at(0, 2.5, 0.09);
    g.box({ w: 0.6, h: 0.06, d: 0.04 }).color(0x8a8478).at(0, 2.94, 0.09);
  });
}

/** A creosoted telegraph pole with its crossarm and two insulators. */
export function telegraphPole(kit: LevelKit) {
  return kit.group((g) => {
    g.cylinder({ r: 0.1, h: 7.5, sides: 6 }).texture('bark_spruce', { tile: [0.6, 2] }).color(0x3e3630).collider();
    g.box({ w: 1.4, h: 0.1, d: 0.1 }).color(0x3a322c).at(0, 6.9, 0);
    [-0.55, 0.55].forEach((x) => g.cylinder({ r: 0.04, h: 0.12, sides: 5 }).color(0x8a8c88).at(x, 7.0, 0));
  });
}

/** A window box under a sill, its geraniums gone to brown stalks in November. Origin at its bottom center. */
export function flowerBox(kit: LevelKit, w = 1.05) {
  return kit.group((g) => {
    g.box({ w, h: 0.18, d: 0.2 }).texture('wood_planks', { tile: 0.6 }).color(0x6a4a3a);
    g.box({ w: w - 0.06, h: 0.02, d: 0.16 }).color(0x2e2620).at(0, 0.17, 0);
    for (let i = 0; i < 6; i++) {
      const x = -w / 2 + 0.1 + (i * (w - 0.2)) / 5;
      g.box({ w: 0.02, h: 0.1 + ((i * 7) % 3) * 0.04, d: 0.02 }).color(0x4a4232).at(x, 0.18, ((i * 3) % 3) * 0.04 - 0.04);
      if (i % 2 === 0) g.box({ w: 0.09, h: 0.05, d: 0.07 }).color(0x5a4a34).at(x + 0.03, 0.18, 0.04);
    }
  });
}

/**
 * Standing water in a dip of the paving: a dark sheet with a lighter sheen of sky, ragged at the
 * edge from three overlapping patches. Lay it on the surface it sits in; `day` picks the sheen.
 */
export function puddle(kit: LevelKit, w: number, d: number, day: boolean) {
  const sheen = day ? 0x0e1011 : 0x020304;
  return kit.group((g) => {
    [
      [0, 0, w, d, 0],
      [w * 0.3, d * 0.25, w * 0.55, d * 0.7, 25],
      [-w * 0.32, -d * 0.2, w * 0.45, d * 0.6, -18],
    ].forEach(([x, z, pw, pd, yaw], i) =>
      g.plane({ w: pw!, d: pd!, cell: 4 }).color(0x1c2022).emissive(sheen).at(x!, i * 0.002, z!).rotY(yaw!),
    );
  });
}

/** A chopping block with the axe left in it and a few split logs round its foot. */
export function choppingBlock(kit: LevelKit) {
  return kit.group((g) => {
    g.cylinder({ r: 0.26, h: 0.48, sides: 8 }).texture('bark_spruce', { tile: 0.5 }).color(0x6a5a48);
    g.cylinder({ r: 0.24, h: 0.02, sides: 8 }).texture('wood_planks', { tile: 0.4 }).color(0xa08a6c).at(0, 0.48, 0);
    g.box({ w: 0.04, h: 0.6, d: 0.04 }).color(0x7a6448).at(0.05, 0.5, 0.02);
    g.box({ w: 0.03, h: 0.1, d: 0.16 }).color(0x4a4a48).at(0.05, 0.46, 0.06);
    [
      [0.45, 0.1, 30],
      [0.38, -0.32, 75],
      [-0.4, 0.3, -20],
    ].forEach(([x, z, yaw]) => g.box({ w: 0.12, h: 0.1, d: 0.4 }).texture('bark_spruce', { tile: 0.4 }).color(0x7a6a58).at(x!, 0, z!).rotY(yaw!));
  });
}
