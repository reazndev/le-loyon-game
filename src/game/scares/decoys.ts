import { sway } from '../ambient/sway';
import type { Placed } from '../kit/builders';
import type { LevelKit } from '../kit/levelKit';
import type { Beat, Zone } from './beats';

/**
 * Ordinary things that read as a standing man from far off in the fog: a scarecrow, a coat
 * left on a fence post, a camo tarp snagged on a dead branch, a hunter's raised hide with a
 * dark shape in it. Close up they are what they are.
 */
export type DecoyKind = 'scarecrow' | 'coat_on_post' | 'snagged_cape' | 'hunters_stand';

export interface DecoySpot {
  x: number;
  z: number;
  /** Degrees, as for `rotY`. */
  yaw?: number;
  /** The ground's height there, for where `decoySighting` looks. Default 0. */
  y?: number;
}

const WOOD = 0x4a4136;
const DARK = 0x0b0b0a;
const COAT = 0x2a2824;
const CAMO = 0x625f50;

/** Where the head of each decoy is, above the ground: what the player has to look at. */
const HEAD: Record<DecoyKind, number> = { scarecrow: 1.65, coat_on_post: 1.6, snagged_cape: 1.6, hunters_stand: 3.2 };

/** An old coat, shoulders at `top`, hanging empty with its sleeves down. */
function coat(g: LevelKit, top: number): void {
  g.box({ w: 0.5, h: 0.9, d: 0.24 }).color(COAT).at(0, top - 0.9, 0);
  g.box({ w: 0.56, h: 0.08, d: 0.26 }).color(COAT).at(0, top - 0.04, 0);
  [-0.3, 0.3].forEach((x) => g.box({ w: 0.12, h: 0.6, d: 0.14 }).color(COAT).at(x, top - 0.66, 0));
}

/** A felt hat whose crown sits on `top`. */
function hat(g: LevelKit, top: number): void {
  g.box({ w: 0.4, h: 0.03, d: 0.4 }).color(DARK).at(0, top, 0);
  g.box({ w: 0.22, h: 0.12, d: 0.22 }).color(DARK).at(0, top + 0.03, 0);
}

const builders: Record<DecoyKind, (g: LevelKit) => void> = {
  scarecrow: (g) =>
    g.batch((b) => {
      b.box({ w: 0.08, h: 2.1, d: 0.08 }).texture('wood_planks').color(WOOD);
      b.box({ w: 1.3, h: 0.06, d: 0.06 }).texture('wood_planks').color(WOOD).at(0, 1.42, 0);
      coat(b, 1.48);
      b.box({ w: 0.24, h: 0.26, d: 0.22 }).color(0x6a5c44).at(0, 1.52, 0);
      hat(b, 1.78);
    }),
  coat_on_post: (g) =>
    g.batch((b) => {
      b.box({ w: 0.12, h: 1.62, d: 0.12 }).texture('wood_planks').color(WOOD);
      // The rails it stands in, running off either side.
      [0.45, 1.0].forEach((y) => b.box({ w: 2.4, h: 0.07, d: 0.05 }).texture('wood_planks').color(WOOD).at(0, y, 0.09));
      coat(b, 1.5);
      hat(b, 1.62);
    }),
  snagged_cape: (g) => {
    g.batch((b) => {
      b.box({ w: 0.24, h: 2.6, d: 0.24 }).texture('bark_spruce').color(0x3a3229);
      b.box({ w: 0.9, h: 0.07, d: 0.07 }).texture('bark_spruce').color(0x3a3229).at(0.5, 1.85, 0);
    });
    // Hung from the branch tip, hanging down from its hook so it can stir in the wind.
    const cloth = g
      .group((c) => {
        c.box({ w: 0.62, h: 1.25, d: 0.06 }).texture('camo_cape', { tile: 1.2 }).color(CAMO).at(0, -1.3, 0);
        c.box({ w: 0.32, h: 0.3, d: 0.16 }).texture('camo_cape', { tile: 1.2 }).color(0x57544a).at(0, -0.3, 0);
      })
      .at(0.75, 1.88, 0)
      .dynamic();
    sway(g, cloth, { degrees: 3, speed: 0.18, axis: 'z' });
  },
  hunters_stand: (g) =>
    g.batch((b) => {
      const wood = (w: number, h: number, d: number, x: number, y: number, z: number) => b.box({ w, h, d }).texture('wood_planks').color(WOOD).at(x, y, z);
      [-0.7, 0.7].forEach((x) => [-0.7, 0.7].forEach((z) => wood(0.1, 3.9, 0.1, x, 0, z)));
      wood(1.6, 0.08, 1.6, 0, 2.5, 0);
      // Walls to chest height on three sides, the front open over a low board.
      wood(1.5, 0.8, 0.04, 0, 2.58, 0.72);
      [-0.72, 0.72].forEach((x) => wood(0.04, 0.8, 1.5, x, 2.58, 0));
      wood(1.5, 0.35, 0.04, 0, 2.58, -0.72);
      wood(1.8, 0.06, 1.8, 0, 3.9, 0);
      // The ladder up the front.
      [-0.25, 0.25].forEach((x) => wood(0.06, 2.6, 0.06, x, 0, -1.1));
      [0.4, 0.9, 1.4, 1.9, 2.4].forEach((y) => wood(0.5, 0.04, 0.05, 0, y, -1.1));
      // A feed sack with a coat thrown over it on the bench: from below, shoulders and a head.
      b.box({ w: 0.46, h: 0.55, d: 0.3 }).color(DARK).at(0, 2.58, 0.1);
      b.box({ w: 0.22, h: 0.24, d: 0.22 }).color(DARK).at(0, 3.13, 0.1);
    }),
};

/** Builds a decoy standing on the ground at `at`, facing down -Z turned by `yaw`. It is always there. */
export function decoy(kit: LevelKit, kind: DecoyKind, at: DecoySpot): Placed {
  return kit
    .group(builders[kind])
    .at(at.x, 0, at.z)
    .rotY(at.yaw ?? 0)
    .onGround();
}

/**
 * The first time the player looks at the decoy from within 25 m, the night drops silent and a
 * low swell plays, so for a moment it is him. Nothing else happens. Pass `zone` to have it count
 * only while the player stands in it, such as on the path.
 */
export function decoySighting(id: string, kind: DecoyKind, at: DecoySpot, zone?: Zone): Beat {
  const look = { look: { x: at.x, z: at.z, y: (at.y ?? 0) + HEAD[kind], within: 25, angle: 10, hold: 0.5 } };
  return {
    id: `decoy_${id}`,
    when: zone ? [look, { enter: zone }] : look,
    do: [{ silence: 5 }, { sound: 'sfx_sting_low', at: 'ahead', distance: 1 }],
    set: `decoy_${id}`,
  };
}
