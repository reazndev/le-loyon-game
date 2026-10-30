import { boxGeometry } from '../../engine/render/geometry';
import type { MeshBuilder } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';

/**
 * Fribourg village houses from kit shapes: rendered walls on a stone plinth, a deep roof, green or
 * brown shutters, and windows that are lit or dark. A house is built in local coordinates with its
 * front facing +Z; place the returned group with `.at()` and `.rotY()`.
 */

export type Face = 'front' | 'back' | 'left' | 'right';

/** Where a window sits: which wall, which floor (0 is the ground floor), and which column. */
export interface WindowSlot {
  face: Face;
  floor: number;
  col: number;
}

/** `curtain` is a dark window with a pale curtain drawn across the inside, which someone can move. */
export type WindowLook = 'dark' | 'lit' | 'shut' | 'boarded' | 'curtain';

export interface HouseSpec {
  /** Width along the front, in meters. */
  w: number;
  /** Depth from front to back. */
  d: number;
  floors: number;
  /** Window centers along the front and back, as offsets from the middle. */
  front: number[];
  back?: number[];
  /** Window centers along both side walls, as offsets from the middle, positive toward the front. */
  sides?: number[];
  /** Door centers on the front wall. A window in the same place on the ground floor is left out. */
  doors?: number[];
  /** True turns the ridge front to back, so the front shows the gable, as many Fribourg farmhouses do. */
  gableFront?: boolean;
  /** Ridge height above the eaves. */
  roofHeight?: number;
  wall?: number;
  /** Rendered masonry, or grey boards as on a barn. */
  walls?: 'render' | 'boards';
  shutter?: number;
  roof?: number;
  /** Plaster, or brown boards in the gable triangle. */
  gable?: 'plaster' | 'boards';
  /** How each window looks. Default dark with open shutters. */
  window?: (slot: WindowSlot) => WindowLook;
  /** Lit windows get a halo in the fog. For night, when a lit window is the only thing to see. */
  glow?: boolean;
  /** Hands over the lit pane, the curtain, or the dark behind the boards, for scenes that change them. They stay out of `kit.batch`. */
  capture?: (slot: WindowSlot, part: MeshBuilder) => void;
}

export const FLOOR = 2.6;
const PLINTH = 0.45;
const OVERHANG = 0.9;
const WINDOW = { w: 0.95, h: 1.25 };
const SILL = 0.95;

/** Colors used across the village, so houses read as one place. */
export const palette = {
  render: 0xb8b4aa,
  renderWarm: 0xbcb2a0,
  renderGrey: 0xa09e98,
  white: 0xc8c6be,
  shutterGreen: 0x7a8a76,
  shutterBrown: 0x8a6e5a,
  shutterRed: 0x8e5a50,
  roof: 0x8a7468,
  roofDark: 0x6a625e,
  boards: 0x6e5a48,
  stone: 0x8a8880,
  lit: 0xe0c48a,
  litDay: 0xb8a684,
} as const;

/** The height of a house's walls, from the ground to the eaves. */
export const wallHeight = (floors: number): number => PLINTH + floors * FLOOR + 0.25;

export function house(kit: LevelKit, spec: HouseSpec) {
  const height = wallHeight(spec.floors);
  const roofHeight = spec.roofHeight ?? Math.min(spec.gableFront ? spec.w : spec.d, 11) * 0.42;
  const look = spec.window ?? (() => 'dark' as const);
  return kit.group((g) => {
    g.box({ w: spec.w + 0.12, h: PLINTH, d: spec.d + 0.12 }).texture('stone_wall', { tile: 1.4 }).color(palette.stone).collider();
    const boards = spec.walls === 'boards';
    g.box({ w: spec.w, h: height, d: spec.d, cell: 1.5 })
      .texture(boards ? 'wood_planks' : 'render_wall', { tile: boards ? 2.2 : 3 })
      .color(spec.wall ?? (boards ? palette.boards : palette.render));
    roof(g, spec, height, roofHeight);

    const doors = spec.doors ?? [];
    const faces: { face: Face; cols: number[]; along: number; depth: number; yaw: number }[] = [
      { face: 'front', cols: spec.front, along: spec.w, depth: spec.d, yaw: 0 },
      { face: 'back', cols: spec.back ?? [], along: spec.w, depth: spec.d, yaw: 180 },
      { face: 'left', cols: spec.sides ?? [], along: spec.d, depth: spec.w, yaw: -90 },
      { face: 'right', cols: spec.sides ?? [], along: spec.d, depth: spec.w, yaw: 90 },
    ];
    faces.forEach(({ face, cols, depth, yaw }) =>
      g
        .group((wall) => {
          for (let floor = 0; floor < spec.floors; floor++) {
            cols.forEach((x, col) => {
              if (face === 'front' && floor === 0 && doors.some((d) => Math.abs(d - x) < 1.2)) return;
              // Side walls list offsets toward the front; the left wall runs the other way.
              const along = face === 'left' ? -x : x;
              const slot = { face, floor, col };
              const shown = look(slot);
              windowAt(wall, shown, spec.shutter ?? palette.shutterGreen, (part) => spec.capture?.(slot, part.dynamic())).at(along, PLINTH + floor * FLOOR + SILL, 0);
              if (spec.glow && shown === 'lit') wall.glow(2.2, 0xffc878).at(along, PLINTH + floor * FLOOR + SILL + WINDOW.h / 2, 0.3);
            });
          }
          if (face === 'front') doors.forEach((x) => doorway(wall).at(x, 0, 0));
        })
        .at(...facePosition(face, depth))
        .rotY(yaw),
    );
  });
}

function facePosition(face: Face, depth: number): [number, number, number] {
  const half = depth / 2;
  return face === 'front' ? [0, 0, half] : face === 'back' ? [0, 0, -half] : face === 'left' ? [-half, 0, 0] : [half, 0, 0];
}

/** One window on a wall plane, facing +Z, its bottom edge at the group's origin. */
function windowAt(kit: LevelKit, look: WindowLook, shutter: number, capture: (part: MeshBuilder) => void) {
  return kit.group((g) => {
    if (look === 'shut') {
      g.box({ w: WINDOW.w, h: WINDOW.h, d: 0.06 }).texture('shutters', { tile: [WINDOW.w, WINDOW.h] }).color(shutter);
      return;
    }
    if (look === 'boarded') {
      // The dark behind the boards; a light inside can show in the gaps through its emissive.
      capture(g.box({ w: WINDOW.w, h: WINDOW.h, d: 0.04 }).color(0x14130f));
      [0.15, 0.5, 0.85].forEach((y) =>
        g.box({ w: WINDOW.w + 0.2, h: 0.2, d: 0.05 }).texture('wood_planks', { tile: 1 }).color(0x6a6058).at(0, WINDOW.h * y - 0.1, 0.03),
      );
      return;
    }
    g.box({ w: WINDOW.w, h: WINDOW.h, d: 0.04 }).texture('window_dark', { tile: [WINDOW.w, WINDOW.h] }).color(0x9a9c9e);
    // A lit pane sits just in front of a dark one, so a light can go out by hiding it.
    if (look === 'lit') capture(g.box({ w: WINDOW.w, h: WINDOW.h, d: 0.05 }).texture('window_lit', { tile: [WINDOW.w, WINDOW.h] }).unlit().color(palette.lit).at(0, 0, 0.01));
    if (look === 'curtain') capture(g.box({ w: WINDOW.w * 0.45, h: WINDOW.h * 0.9, d: 0.02 }).color(0x8a867c).at(-WINDOW.w * 0.22, WINDOW.h * 0.05, 0.035));
    [-1, 1].forEach((side) =>
      g
        .box({ w: WINDOW.w / 2, h: WINDOW.h, d: 0.04 })
        .texture('shutters', { tile: [WINDOW.w, WINDOW.h] })
        .color(shutter)
        .at(side * (WINDOW.w * 0.75 + 0.04), 0, 0.02),
    );
    g.box({ w: WINDOW.w + 0.16, h: 0.06, d: 0.16 }).color(0x8c8a84).at(0, -0.06, 0.04);
  });
}

/** A recessed front door with a stone step. The door itself is added by the caller where it opens. */
function doorway(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 1.3, h: 0.16, d: 0.6 }).texture('stone_wall', { tile: 1 }).color(0x96948c).at(0, 0, 0.3).walkable('stone');
    g.box({ w: 1.1, h: 2.15, d: 0.04 }).texture('door_wood', { tile: [1.1, 2.15] }).color(0x9a8a7a).at(0, PLINTH * 0.4, 0.02);
    g.box({ w: 1.3, h: 0.12, d: 0.08 }).color(0x8c8a84).at(0, PLINTH * 0.4 + 2.15, 0.03);
  });
}

/**
 * Two thick roof slabs over a gable fill. The slabs overhang the walls on every side, so the eaves
 * throw a deep shadow line, which is most of what makes a house read as Swiss in fog.
 */
function roof(kit: LevelKit, spec: HouseSpec, height: number, rise: number): void {
  const [along, across] = spec.gableFront ? [spec.d, spec.w] : [spec.w, spec.d];
  kit
    .group((r) => {
      const gableTexture = spec.gable === 'boards' ? 'wood_planks' : 'render_wall';
      r.gable({ w: along, d: across, h: rise, cell: 1.5 })
        .texture(gableTexture, { tile: spec.gable === 'boards' ? 1.6 : 3 })
        .color(spec.gable === 'boards' ? palette.boards : (spec.wall ?? palette.render));
      const slope = Math.hypot(across / 2, rise);
      const tilt = Math.atan2(rise, across / 2);
      const length = slope + OVERHANG;
      [0, 180].forEach((yaw) =>
        r
          .mesh(
            boxGeometry(along + OVERHANG * 2, 0.18, length, 1.5)
              .translate(0, 0, length / 2)
              .rotateX(tilt)
              .translate(0, rise, 0),
          )
          .texture('roof_tiles', { tile: 1.8 })
          .color(spec.roof ?? palette.roof)
          .rotY(yaw),
      );
    })
    .at(0, height, 0)
    .rotY(spec.gableFront ? 90 : 0);
}

/** Firewood stacked against a wall under the eaves, log ends out. Origin at the bottom center of the stack. */
export function woodpile(kit: LevelKit, w: number, h = 1.3) {
  return kit.group((g) => {
    g.box({ w, h, d: 0.55 }).texture('bark_spruce', { tile: 0.5 }).color(0x7a6a58).collider();
    // A face of sawn ends, lighter than the bark.
    g.box({ w: w - 0.04, h: h - 0.04, d: 0.02 }).texture('wood_planks', { tile: [0.3, 0.25] }).color(0xa08a6c).at(0, 0.02, 0.28);
    g.box({ w: w + 0.2, h: 0.05, d: 0.7 }).texture('wood_planks', { tile: 1 }).color(0x5a5048).at(0, h, 0);
  });
}
