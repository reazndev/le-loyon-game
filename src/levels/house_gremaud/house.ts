import type { MeshBuilder, Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { house, palette, type WindowLook, type WindowSlot } from '../village_square/houses';

/**
 * The syndic's house: neat, white, two floors, a garage on the left where his Opel stands under
 * a sheet. The front door sits in a small porch, so when it opens a hand's width there is room
 * behind it for Odile. Built facing +Z; both the square and the doorstep scene place it.
 */

export const GREMAUD_HOUSE = { w: 9, d: 8 };
/** The front door, in house coordinates: hinge on the left, opening inward. */
export const DOOR = { x: -0.4, w: 0.95, h: 2.1, z: GREMAUD_HOUSE.d / 2 + 1.05 };
const PORCH = { w: 1.75, d: 1.1, h: 2.55 };
/** The upstairs window whose curtain moves (vil_curtain, odile_closed). */
const CURTAIN_SLOT: WindowSlot = { face: 'front', floor: 1, col: 1 };

export interface GremaudHouse {
  group: Placed;
  /** The door leaf, pivoting on its hinge. Positive `rotation.y` opens it inward. */
  leaf: Placed;
  curtain: MeshBuilder | null;
}

export function gremaudHouse(kit: LevelKit, look: (slot: WindowSlot) => WindowLook): GremaudHouse {
  const parts: { leaf?: Placed; curtain?: MeshBuilder } = {};
  const front = GREMAUD_HOUSE.d / 2;
  const group = kit.group((g) => {
    house(g, {
      ...GREMAUD_HOUSE,
      floors: 2,
      front: [-2.9, -0.4, 2.6],
      sides: [-2, 1.8],
      back: [-2.4, 2.4],
      wall: palette.white,
      shutter: palette.shutterGreen,
      roof: palette.roofDark,
      window: (slot) => (slot.face === 'front' && slot.floor === 0 && slot.col === 1 ? 'dark' : sameSlot(slot, CURTAIN_SLOT) ? 'curtain' : look(slot)),
      capture: (slot, part) => {
        if (sameSlot(slot, CURTAIN_SLOT)) parts.curtain = part;
      },
    });

    // The porch: white walls either side, a lintel, a dark hall behind, a little roof.
    g.group((p) => {
      [-1, 1].forEach((side) =>
        p
          .box({ w: (PORCH.w - DOOR.w) / 2, h: PORCH.h, d: PORCH.d })
          .texture('render_wall', { tile: 2 })
          .color(palette.white)
          .at((side * (PORCH.w + DOOR.w)) / 4, 0, 0)
          .collider(),
      );
      p.box({ w: PORCH.w, h: PORCH.h - DOOR.h - 0.2, d: PORCH.d }).texture('render_wall', { tile: 2 }).color(palette.white).at(0, DOOR.h + 0.2, 0);
      p.box({ w: DOOR.w, h: DOOR.h + 0.2, d: 0.05 }).color(0x0c0b0a).at(0, 0, -PORCH.d / 2 + 0.03);
      p.plane({ w: DOOR.w, d: PORCH.d, cell: 0.5 }).texture('wood_floor', { tile: 1 }).color(0x4a4038).at(0, 0.21, 0);
      p.box({ w: PORCH.w + 0.6, h: 0.12, d: PORCH.d + 0.6 }).texture('roof_tiles', { tile: 1.2 }).color(palette.roofDark).at(0, PORCH.h, 0.15);
      // The step, the brass plate, the bell push, the boot scraper.
      p.box({ w: PORCH.w + 0.3, h: 0.2, d: 0.7 }).texture('stone_wall', { tile: 1 }).color(0x9a988f).at(0, 0, PORCH.d / 2 + 0.35).walkable('stone');
      p.box({ w: 0.24, h: 0.08, d: 0.02 }).color(0xa88a40).emissive(0x1a1406).at(PORCH.w / 2 - 0.25, 1.45, PORCH.d / 2 + 0.01);
      p.box({ w: 0.05, h: 0.07, d: 0.03 }).color(0xd8d0b8).at(PORCH.w / 2 - 0.25, 1.28, PORCH.d / 2 + 0.01);
      p.box({ w: 0.36, h: 0.12, d: 0.08 }).color(0x2a2826).at(-PORCH.w / 2 - 0.3, 0, PORCH.d / 2 + 0.2);
    }).at(DOOR.x, 0, front + PORCH.d / 2);

    parts.leaf = g
      .group((l) => {
        l.box({ w: DOOR.w, h: DOOR.h, d: 0.06 }).texture('door_wood', { tile: [DOOR.w, DOOR.h] }).color(0xa49482).at(DOOR.w / 2, 0, 0);
      })
      .at(DOOR.x - DOOR.w / 2, 0.2, DOOR.z);

    // The geranium box under the front window, empty for winter.
    g.box({ w: 1.1, h: 0.2, d: 0.22 }).texture('wood_planks', { tile: 0.6 }).color(0x6a4a3a).at(-2.9, 1.15, front + 0.12);
    [-0.35, -0.1, 0.2, 0.4].forEach((x, i) => g.box({ w: 0.02, h: 0.12 + (i % 2) * 0.06, d: 0.02 }).color(0x4a4232).at(-2.9 + x, 1.35, front + 0.12));

    garage(g);
  });
  return { group, leaf: parts.leaf!, curtain: parts.curtain ?? null };
}

/** The garage on the left, its two wooden leaves shut on the Opel under its sheet. */
function garage(kit: LevelKit): void {
  const { w, d } = GREMAUD_HOUSE;
  kit
    .group((g) => {
      g.box({ w: 3.6, h: 2.7, d: d - 1 }).texture('render_wall', { tile: 3 }).color(palette.white).collider();
      g.box({ w: 4.2, h: 0.16, d: d - 0.2 }).texture('roof_tiles', { tile: 1.5 }).color(palette.roofDark).at(0, 2.7, 0.2);
      [-0.7, 0.7].forEach((x) => g.box({ w: 1.38, h: 2.15, d: 0.05 }).texture('wood_planks', { tile: [0.8, 2.15] }).color(0x7a6656).at(x, 0, (d - 1) / 2 + 0.02));
      g.box({ w: 0.04, h: 0.25, d: 0.04 }).color(0x2a2826).at(0, 1.0, (d - 1) / 2 + 0.06);
    })
    .at(-w / 2 - 1.8, 0, -0.5);
}

const sameSlot = (a: WindowSlot, b: WindowSlot) => a.face === b.face && a.floor === b.floor && a.col === b.col;
