import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { boxGeometry } from '../../engine/render/geometry';
import type { LevelKit } from '../../game/kit/levelKit';
import type { MeshBuilder } from '../../game/kit/builders';
import type { SceneContext } from '../../game/scene';
import { dialogues, type StoryFlag } from '../../content';
import { playNode } from '../forest_path/play';
import { everyFrame } from './everyFrame';
import { CANDLE_RACK, CHANCEL, CONFESSIONAL, NAVE, PEW, PEW_ROWS, RAISED, SIDE_ALTAR, SIDE_DOOR, WALL } from './layout';

/** The furniture of the nave and chancel, and the things in them the player can look at. */

const DARK_WOOD = 0x3c3028;
const PAINTED_WOOD = 0x8e7e64;

/** Set when the player sits in the confessional, so `chu_confessional` can follow. */
export const SAT_IN_CONFESSIONAL: StoryFlag = 'sat_in_confessional';

export function buildNave(kit: LevelKit, ctx: SceneContext): void {
  pews(kit);
  altar(kit);
  sideAltar(kit, ctx);
  confessional(kit, ctx);
  stations(kit);
  saintMaurice(kit, ctx);
  doorFittings(kit, ctx);
  lamps(kit);
}

/** Twelve rows of pews in two blocks, each pew one mesh. */
function pews(kit: LevelKit): void {
  const half = PEW.w / 2;
  const pew = mergeGeometries([
    boxGeometry(PEW.w, 0.06, 0.42, 1).translate(0, 0.42, 0),
    boxGeometry(PEW.w, 0.52, 0.05, 1).translate(0, 0.5, 0.21),
    boxGeometry(PEW.w, 0.06, 0.14, 1).translate(0, 0.1, -0.42),
    boxGeometry(0.06, 0.96, 0.6, 1).translate(-half, 0, -0.04),
    boxGeometry(0.06, 0.96, 0.6, 1).translate(half, 0, -0.04),
  ])!;
  for (let row = 0; row < PEW_ROWS; row++) {
    const z = PEW.firstZ - row * PEW.spacing;
    [-1, 1].forEach((side) =>
      kit.mesh(pew.clone()).texture('pew_wood', { tile: 1.1 }).color(row % 3 === 1 ? 0x8a7a6c : 0x948474).at(side * PEW.x, 0, z).collider(),
    );
  }
}

/** The painted wooden altar, the retable against the east wall, the communion rail. */
function altar(kit: LevelKit): void {
  const z = CHANCEL.z0 + 1.6;
  const floor = RAISED;
  kit.box({ w: 3.2, h: 0.15, d: 1.8 }).texture('church_stone', { tile: 1 }).color(0x9c988e).at(0, floor, z).walkable('stone');
  const top = floor + 0.15;
  kit.box({ w: 2.2, h: 0.98, d: 0.8 }).texture('pew_wood', { tile: 1 }).color(PAINTED_WOOD).at(0, top, z - 0.1).collider();
  kit.box({ w: 1.7, h: 0.62, d: 0.02 }).color(0x4e5e6c).at(0, top + 0.16, z + 0.31);
  kit.box({ w: 0.08, h: 0.42, d: 0.02 }).color(0xa08a50).at(0, top + 0.26, z + 0.33);
  kit.box({ w: 0.3, h: 0.08, d: 0.02 }).color(0xa08a50).at(0, top + 0.56, z + 0.33);
  kit.box({ w: 2.32, h: 0.03, d: 0.86 }).color(0xcdc9bd).at(0, top + 0.98, z - 0.1);
  kit.box({ w: 0.5, h: 0.5, d: 0.4 }).color(0x8c7a4c).at(0, top + 1.01, z - 0.3);
  [-0.8, 0.8].forEach((x) => {
    kit.cylinder({ r: 0.05, h: 0.4, sides: 6 }).color(0x8c7a4c).at(x, top + 1.01, z - 0.2);
    kit.cylinder({ r: 0.025, h: 0.3, sides: 5 }).color(0xd8d2c0).at(x, top + 1.41, z - 0.2);
  });

  // Retable: columns, a dark painting of the saint's martyrdom, the cross above.
  const back = CHANCEL.z0 + WALL / 2 + 0.14;
  kit.box({ w: 3.4, h: 3.5, d: 0.28 }).texture('pew_wood', { tile: 1.4 }).color(0x6e5c4a).at(0, floor, back);
  kit.box({ w: 1.5, h: 2.1, d: 0.04 }).color(0x4a2e28).at(0, floor + 1.15, back + 0.15);
  kit.box({ w: 0.5, h: 0.9, d: 0.02 }).color(0x6a5a48).at(-0.2, floor + 1.4, back + 0.18);
  [-1.25, 1.25].forEach((x) => kit.cylinder({ r: 0.12, h: 2.6, sides: 8 }).color(0x8a7c6c).at(x, floor + 0.6, back + 0.2));
  kit.box({ w: 3.7, h: 0.3, d: 0.45 }).texture('pew_wood', { tile: 1 }).color(0x76644e).at(0, floor + 3.5, back + 0.05);
  kit.box({ w: 0.1, h: 1.3, d: 0.08 }).color(0x3a2e26).at(0, floor + 3.8, back + 0.1);
  kit.box({ w: 0.75, h: 0.1, d: 0.08 }).color(0x3a2e26).at(0, floor + 4.65, back + 0.1);
  kit.box({ w: 0.12, h: 0.55, d: 0.06 }).color(0xbcb09c).at(0, floor + 4.15, back + 0.16);

  // Communion rail, open in the middle.
  [-1, 1].forEach((side) => {
    const w = CHANCEL.x1 - 0.25 - 0.75;
    const x = side * (0.75 + w / 2);
    kit.box({ w, h: 0.08, d: 0.16 }).texture('pew_wood', { tile: 1 }).color(0x6e5e50).at(x, floor + 0.72, CHANCEL.z1 - 0.35);
    kit.box({ w, h: 0.72, d: 0.06 }).texture('pew_wood', { tile: 1 }).color(0x5e5044).at(x, floor, CHANCEL.z1 - 0.35).collider();
  });
}

/**
 * The Virgin's side altar on the north side of the nave, the kneeler where the abbé prays on
 * day 3, and the rack of votive candles: three burn, a fourth once the player lights one.
 */
function sideAltar(kit: LevelKit, ctx: SceneContext): void {
  const { x, z } = SIDE_ALTAR;
  kit.box({ w: 1.5, h: 2.7, d: 0.04 }).color(0x46566a).at(NAVE.x1 - WALL / 2 - 0.02, 0, z).rotY(90);
  kit.box({ w: 1.4, h: 0.95, d: 0.6 }).texture('church_stone', { tile: 1 }).color(0xa8a49a).at(x, 0, z).rotY(90).collider();
  kit.box({ w: 1.5, h: 0.03, d: 0.66 }).color(0xcdc9bd).at(x, 0.95, z).rotY(90);
  kit.box({ w: 0.36, h: 0.25, d: 0.3 }).texture('church_stone', { tile: 0.6 }).color(0xb0aca2).at(x + 0.08, 0.98, z);
  kit.cylinder({ r: 0.14, h: 0.8, sides: 8 }).color(0x9eaabb).at(x + 0.08, 1.23, z);
  kit.cylinder({ r: 0.09, h: 0.2, sides: 6 }).color(0xc8ccd4).at(x + 0.08, 1.98, z);
  kit.box({ w: 0.11, h: 0.13, d: 0.11 }).color(0xcdbfa8).at(x + 0.02, 2.0, z);
  kit.box({ w: 0.16, h: 0.05, d: 0.2 }).color(0x9eaabb).at(x + 0.02, 1.62, z);
  // Kneeler.
  kit.box({ w: 0.7, h: 0.82, d: 0.1 }).texture('pew_wood', { tile: 1 }).color(0x6a5a4c).at(SIDE_ALTAR.x - 0.62, 0, z).rotY(90).collider();
  kit.box({ w: 0.7, h: 0.1, d: 0.3 }).texture('pew_wood', { tile: 1 }).color(0x6a5a4c).at(SIDE_ALTAR.x - 1.0, 0, z).rotY(90);

  // The rack: a black iron stand with three rows of cups.
  const rack = CANDLE_RACK;
  kit.box({ w: 0.9, h: 0.06, d: 0.36 }).texture('rust_metal', { tile: 0.6 }).color(0x302c2a).at(rack.x, 0.88, rack.z).rotY(90).collider();
  [-0.38, 0.38].forEach((dz) => kit.box({ w: 0.04, h: 0.88, d: 0.04 }).color(0x2a2624).at(rack.x, 0, rack.z + dz));
  kit.box({ w: 0.16, h: 0.22, d: 0.12 }).texture('rust_metal', { tile: 0.4 }).color(0x4a3a2c).at(rack.x - 0.1, 0.94, rack.z + 0.52);
  const cups = [-0.3, -0.15, 0, 0.15, 0.3].flatMap((dz) => [-0.1, 0.02, 0.12].map((dx) => ({ x: rack.x + dx, z: rack.z + dz })));
  const burning = [2, 7, 11];
  cups.forEach((cup, i) => {
    kit.cylinder({ r: 0.028, h: i % 4 === 0 ? 0.03 : 0.07, sides: 5 }).color(0xcfc8b4).at(cup.x, 0.94, cup.z);
    if (burning.includes(i)) flame(kit, cup.x, 1.03, cup.z);
  });
  // Lit by the player: hidden until `lit_candle` is set.
  const mine = cups[13]!;
  const flameParts = flame(kit, mine.x, 1.03, mine.z);
  everyFrame(kit, () => flameParts.forEach((part) => (part.object.visible = ctx.state.hasFlag('lit_candle'))));
  kit.light({ color: 0xffa858, intensity: 1.1, range: 4.2 }).flicker(0.35).at(rack.x - 0.3, 1.4, rack.z);
  kit.hotspot({ prompt: 'Look at the candles', radius: 0.5, onInteract: () => playNode(ctx, 'church_candles') }).at(rack.x, 0, rack.z);
}

/** A small candle flame: an unlit wick light and a soft halo. */
function flame(kit: LevelKit, x: number, y: number, z: number): MeshBuilder[] {
  return [kit.box({ w: 0.02, h: 0.04, d: 0.02 }).color(0xffd890).unlit().at(x, y, z), kit.glow(0.22, 0xb07030).at(x, y + 0.03, z)];
}

/** Dark wood against the west wall at the back, the priest's door between two penitents' sides. */
function confessional(kit: LevelKit, ctx: SceneContext): void {
  const { x, z } = CONFESSIONAL;
  kit
    .group((g) => {
      g.box({ w: 2.7, h: 2.4, d: 0.9 }).texture('pew_wood', { tile: 1.2 }).color(0x4a3c32);
      g.box({ w: 2.9, h: 0.22, d: 1.04 }).texture('pew_wood', { tile: 1 }).color(DARK_WOOD).at(0, 2.4, 0);
      g.box({ w: 0.78, h: 2.0, d: 0.04 }).texture('door_wood', { tile: [0.78, 2] }).color(0x6a5a4c).at(0, 0.05, 0.46);
      g.box({ w: 0.12, h: 0.14, d: 0.02 }).color(0x1a1612).at(0, 1.55, 0.49);
      g.box({ w: 0.72, h: 1.85, d: 0.04 }).color(0x47284c).at(-0.92, 0.12, 0.47);
      g.box({ w: 0.72, h: 1.85, d: 0.04 }).texture('pew_wood', { tile: 1 }).color(0x544438).at(0.92, 0.12, 0.47);
      [-0.47, 0.47].forEach((dx) => g.box({ w: 0.1, h: 2.4, d: 0.1 }).color(DARK_WOOD).at(dx, 0, 0.47));
    })
    .at(x, 0, z)
    .rotY(90);
  kit.barrier({ w: 0.95, d: 2.75 }).at(x, 0, z);

  const base = dialogues.church_confessional;
  const first = base.nodes.church_confessional!;
  const sitting = {
    ...base,
    nodes: {
      ...base.nodes,
      church_confessional: {
        ...first,
        choices: first.choices!.map((c) => (c.next === 'church_confessional_in' ? { ...c, effects: { set: SAT_IN_CONFESSIONAL } } : c)),
      },
    },
  };
  kit.hotspot({ prompt: 'Look at the confessional', radius: 0.6, onInteract: () => ctx.dialogue(sitting) }).at(x + 0.6, 0, z - 0.9);
}

/** Fourteen small Stations of the Cross in faded oil, seven on each side wall. */
function stations(kit: LevelKit): void {
  const west = [4.6, 3.0, -1.0, -2.6, -6.4, -8.0, -9.6];
  const east = [9.4, 8.0, 4.6, 3.0, -1.0, -2.1, -9.6];
  const paint = [0x5a4c40, 0x4c4a44, 0x5e5044, 0x4a4238, 0x564a3e, 0x524840, 0x4e463e];
  const frame = (wallX: number, inward: 1 | -1, z: number, i: number) => {
    const face = wallX + inward * (WALL / 2 + 0.03);
    kit.box({ w: 0.5, h: 0.62, d: 0.05 }).color(DARK_WOOD).at(face, 2.15, z).rotY(90);
    kit.box({ w: 0.38, h: 0.48, d: 0.02 }).color(paint[i % paint.length]!).at(face + inward * 0.03, 2.22, z).rotY(90);
    kit.box({ w: 0.04, h: 0.16, d: 0.03 }).color(DARK_WOOD).at(face, 2.79, z).rotY(90);
  };
  west.forEach((z, i) => frame(NAVE.x0, 1, z, i));
  east.forEach((z, i) => frame(NAVE.x1, -1, z, i + 3));
}

/** The patron over the side door: a Roman soldier with a white cross on a red banner. */
function saintMaurice(kit: LevelKit, ctx: SceneContext): void {
  const face = CHANCEL.x1 - WALL / 2 - 0.03;
  const z = SIDE_DOOR.z;
  const y = RAISED + 2.5;
  const at = (dx: number, dy: number, dz: number) => [face - dx, y + dy, z + dz] as const;
  kit.box({ w: 1.0, h: 1.4, d: 0.06 }).color(0x4e3e2c).at(...at(0, 0, 0)).rotY(90);
  kit.box({ w: 0.86, h: 1.26, d: 0.02 }).color(0x34302a).at(...at(0.04, 0.07, 0)).rotY(90);
  kit.box({ w: 0.22, h: 0.62, d: 0.02 }).color(0x7a7a72).at(...at(0.06, 0.32, 0.05)).rotY(90);
  kit.box({ w: 0.1, h: 0.11, d: 0.02 }).color(0xa88a70).at(...at(0.06, 0.94, 0.05)).rotY(90);
  kit.box({ w: 0.02, h: 0.9, d: 0.02 }).color(0x5a4a38).at(...at(0.07, 0.25, -0.16)).rotY(90);
  kit.box({ w: 0.26, h: 0.2, d: 0.02 }).color(0x7a2a22).at(...at(0.07, 0.92, -0.28)).rotY(90);
  kit.box({ w: 0.04, h: 0.16, d: 0.01 }).color(0xcfcbc0).at(...at(0.085, 0.94, -0.28)).rotY(90);
  kit.box({ w: 0.16, h: 0.035, d: 0.01 }).color(0xcfcbc0).at(...at(0.085, 1.0, -0.28)).rotY(90);
  kit.hotspot({ prompt: 'Look at the painting', radius: 0.5, onInteract: () => playNode(ctx, 'church_saint_maurice') }).at(CHANCEL.x1 - 0.9, 0, z + 0.9);
}

/** The notice board and the holy water stoup by the main door. */
function doorFittings(kit: LevelKit, ctx: SceneContext): void {
  const face = NAVE.z1 - WALL / 2 - 0.03;
  kit.box({ w: 0.8, h: 0.58, d: 0.04 }).color(0x6e5640).at(1.9, 1.1, face);
  [
    [-0.2, 0.08, 0.22, 0.3],
    [0.12, 0.12, 0.2, 0.26],
    [0.1, -0.12, 0.3, 0.14],
  ].forEach(([dx, dy, w, h]) => kit.box({ w: w!, h: h!, d: 0.01 }).color(0xc8c4b6).at(1.9 + dx!, 1.25 + dy!, face - 0.03));
  kit.hotspot({ prompt: 'Read the bulletin', radius: 0.45, onInteract: () => playNode(ctx, 'church_bulletin') }).at(1.9, 0, face - 0.5);
  kit.box({ w: 0.36, h: 0.14, d: 0.24 }).texture('church_stone', { tile: 0.5 }).color(0xaaa69c).at(-1.25, 0.95, face - 0.1);
  kit.box({ w: 0.1, h: 0.3, d: 0.1 }).texture('church_stone', { tile: 0.5 }).color(0x9a968c).at(-1.25, 0.65, face - 0.05);
}

/** The sanctuary lamp by the altar and the electric candle crowns over the nave, all dim. */
function lamps(kit: LevelKit): void {
  const lamp = { x: -2.1, z: CHANCEL.z0 + 2.4, y: RAISED + 2.4 };
  kit.box({ w: 0.015, h: CHANCEL.h - lamp.y - 0.15, d: 0.015 }).color(0x3a3430).at(lamp.x, lamp.y + 0.15, lamp.z);
  kit.cylinder({ r: 0.07, h: 0.15, sides: 6 }).color(0xc02818).unlit().at(lamp.x, lamp.y, lamp.z);
  kit.glow(0.8, 0x701810).at(lamp.x, lamp.y + 0.08, lamp.z);
  kit.light({ color: 0xc04028, intensity: 0.7, range: 3 }).flicker(0.15).at(lamp.x, lamp.y, lamp.z);

  [3.4, -3.6].forEach((z) => {
    kit.box({ w: 0.02, h: 2.2, d: 0.02 }).color(0x2a2624).at(0, NAVE.h - 2.2, z);
    kit.cylinder({ r: 0.45, h: 0.05, sides: 8 }).texture('rust_metal', { tile: 0.5 }).color(0x3a3430).at(0, NAVE.h - 2.25, z);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const [bx, bz] = [Math.cos(a) * 0.42, z + Math.sin(a) * 0.42];
      kit.box({ w: 0.04, h: 0.14, d: 0.04 }).color(0xd8d0bc).at(bx, NAVE.h - 2.2, bz);
      kit.box({ w: 0.03, h: 0.05, d: 0.03 }).color(0xffd8a0).unlit().at(bx, NAVE.h - 2.06, bz);
    }
    kit.glow(1.1, 0x4a3820).at(0, NAVE.h - 2.05, z);
    kit.light({ color: 0xd8b888, intensity: 0.55, range: 6 }).at(0, NAVE.h - 2.4, z);
  });
}
