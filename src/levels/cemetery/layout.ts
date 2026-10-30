import { hashString, seededRandom } from '../../engine/random';
import type { DocumentId, NodeId } from '../../content';

/**
 * The cemetery on the hill, as data: walls, gates, rows, and every grave. The front gate faces
 * south (+Z) toward the village, the back gate opens north (-Z) onto the Bois-Noir. Stones stand
 * at the north end of their beds, so a reader faces north with their back to the front gate.
 */

export interface Rect {
  x: number;
  z: number;
  w: number;
  d: number;
}

export const GROUNDS: Rect = { x: 0, z: 0, w: 40, d: 25 };
export const WALL_HEIGHT = 1.1;
export const FRONT_Z = GROUNDS.z + GROUNDS.d / 2;
export const BACK_Z = GROUNDS.z - GROUNDS.d / 2;
export const WEST_X = GROUNDS.x - GROUNDS.w / 2;
export const EAST_X = GROUNDS.x + GROUNDS.w / 2;
export const FRONT_GATE = { x: 0, z: FRONT_Z, w: 2.6 };
export const BACK_GATE = { x: -8.5, z: BACK_Z, w: 1.3 };
export const PATH_WIDTH = 2;

/** The z of each row's stones, front row first. Row 5 stands against the forest wall. */
export const ROWS = [9, 4, -1, -6, -11] as const;
export const BED_LENGTH = 1.8;
/** Gap between a stone and the head of its bed. */
export const BED_GAP = 0.12;

/** The ossuary from the 1700s, now the gravedigger's shed. Its door faces the central path. */
export const SHED: Rect = { x: -15.5, z: 9.75, w: 3.4, d: 2.8 };
export const TAP = { x: 3.4, z: 11.2 };
export const BIN = { x: 5.4, z: 11.5 };

export type GraveKind = 'slab' | 'peaked' | 'iron_cross' | 'wood_cross' | 'flat' | 'family';
export type Bed = 'gravel' | 'heather' | 'grass' | 'flowers';
export type Refusal = Extract<NodeId, 'dig_menoud' | 'dig_therese' | 'dig_other' | 'dig_gremaud'>;
export type GraveDocument = Extract<DocumentId, `grave_${string}`>;

export interface Grave {
  /** The inscription, when it can be read. */
  doc?: GraveDocument;
  /** Center of the stone's foot. */
  x: number;
  z: number;
  kind: GraveKind;
  stone: 'granite' | 'sandstone';
  w: number;
  h: number;
  bed: Bed;
  lantern: boolean;
  /** 1 to 5, front to back. */
  row: number;
}

type Slot = [x: number, what: GraveDocument | 'chassot' | null];

/** Slots per row, front row first. `null` is a family stone with no inscription the reporter reads. */
const slots: Slot[][] = [
  [[-9.4, null], [-6.2, null], [-3, null], [6.2, null], [9.4, null], [16, null]],
  [[-15.8, 'grave_rossier_andre'], [-12.6, null], [-9.4, null], [-6.2, null], [-3, 'grave_menoud'], [3, 'grave_misc_7'], [6.2, null], [9.4, null], [12.6, 'grave_misc_8'], [15.8, null]],
  [[-15.8, null], [-12.6, 'grave_gremaud'], [-9.4, 'grave_misc_1'], [-6.2, null], [-3, null], [3, 'grave_misc_3'], [6.2, null], [9.4, 'grave_misc_4'], [12.6, null]],
  [[-15.8, 'grave_bapst_lea'], [-12.6, 'grave_overney_marie'], [-9.4, null], [-6.2, 'grave_clement'], [-3, null], [3, 'grave_misc_2'], [6.2, null], [9.4, null], [12.6, 'grave_misc_6'], [15.8, null]],
  [[-17.2, 'chassot'], [-13, 'grave_python_joseph'], [-4, 'grave_kolly_ernest'], [3, 'grave_misc_5'], [6.2, null], [9.4, 'grave_yerly_ml'], [12.6, null], [15.8, null]],
];

/** Graves whose look is fixed by the script. The rest vary by seed. */
const fixed: Partial<Record<GraveDocument | 'chassot', Partial<Grave>>> = {
  chassot: { kind: 'family', stone: 'granite', w: 2.6, h: 1.25, bed: 'gravel', lantern: false },
  grave_menoud: { kind: 'slab', stone: 'granite', w: 0.75, h: 1.05, bed: 'heather', lantern: true },
  grave_gremaud: { kind: 'flat', stone: 'sandstone', w: 0.9, h: 0.12, bed: 'flowers', lantern: false },
  grave_bapst_lea: { kind: 'wood_cross', stone: 'sandstone', w: 0.45, h: 0.75, bed: 'flowers', lantern: false },
  grave_yerly_ml: { bed: 'flowers', lantern: true },
  grave_rossier_andre: { bed: 'heather', lantern: true },
};

const randomKinds: GraveKind[] = ['slab', 'slab', 'peaked', 'peaked', 'iron_cross'];
const beds: Bed[] = ['gravel', 'gravel', 'grass', 'heather', 'flowers'];

function graveAt(row: number, [x, what]: Slot): Grave {
  const random = seededRandom(hashString(`grave-${row}-${x}`));
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)]!;
  const kind = what ? 'slab' : pick(randomKinds);
  const base: Grave = {
    x,
    z: ROWS[row - 1]!,
    kind,
    stone: random() < 0.55 ? 'granite' : 'sandstone',
    w: kind === 'iron_cross' ? 0.5 : 0.62 + random() * 0.32,
    h: kind === 'iron_cross' ? 1.05 : 0.72 + random() * 0.45,
    bed: pick(beds),
    lantern: random() < 0.4,
    row,
  };
  const doc = what && what !== 'chassot' ? { doc: what } : {};
  return { ...base, ...doc, ...(what ? fixed[what] : {}) };
}

export const graves: readonly Grave[] = slots.flatMap((row, i) => row.map((slot) => graveAt(i + 1, slot)));

export const graveByDoc = (doc: GraveDocument): Grave => graves.find((g) => g.doc === doc)!;
export const chassotGrave = graves.find((g) => g.kind === 'family')!;

/** The rectangle of a grave's bed, in front (south) of its stone. */
export function bedOf(grave: Pick<Grave, 'x' | 'z' | 'w'>, width = Math.max(0.9, grave.w + 0.2)): Rect {
  return { x: grave.x, z: grave.z + BED_GAP + BED_LENGTH / 2, w: width, d: BED_LENGTH };
}

/** The family plot holds two beds under one stone: Marc on the left (west), Thérèse on the right. */
export const CHASSOT_BEDS = {
  marc: { ...bedOf(chassotGrave, 1.2), x: chassotGrave.x - 0.68, d: 2.2, z: chassotGrave.z + BED_GAP + 1.1 },
  therese: { ...bedOf(chassotGrave, 1.2), x: chassotGrave.x + 0.68, d: 2.2, z: chassotGrave.z + BED_GAP + 1.1 },
};

/** Where the boot prints are and where the reporter stands to dig from the edge. */
export const GRAVE_FOOT = { x: CHASSOT_BEDS.marc.x, z: CHASSOT_BEDS.marc.z + CHASSOT_BEDS.marc.d / 2 + 0.55 };

/** What the reporter says when trying to dig a grave that isn't Marc's. */
export function refusalFor(grave: Grave): Refusal {
  if (grave.doc === 'grave_menoud') return 'dig_menoud';
  if (grave.doc === 'grave_gremaud') return 'dig_gremaud';
  // The plot's other hotspot is Thérèse's bed; Marc's side is the dig itself.
  if (grave.kind === 'family') return 'dig_therese';
  return 'dig_other';
}

/** The old stones from the 1800s, set into the inside of the west wall. */
export const OLD_STONES = (['oldstone_1', 'oldstone_2', 'oldstone_3', 'oldstone_4', 'oldstone_5'] as const).map((doc, i) => ({
  doc,
  x: WEST_X + 0.32,
  z: -5.5 + i * 2.6,
}));

/** Gravel cross paths run in front of each row; the central path runs from gate to gate. */
export const CROSS_PATHS = ROWS.map((z, i) => (i === 0 ? (z + BED_GAP + BED_LENGTH + FRONT_Z) / 2 : z + 3.46));
export const CROSS_PATH_WIDTH = 1.3;

/** Where a reader stands in front of a grave, on the path, facing the stone. */
export const readingSpot = (grave: Pick<Grave, 'x' | 'z'>) => ({ x: grave.x, z: grave.z + BED_GAP + BED_LENGTH + 0.6 });

export const inside = (rect: Rect, x: number, z: number, margin = 0): boolean =>
  Math.abs(x - rect.x) <= rect.w / 2 + margin && Math.abs(z - rect.z) <= rect.d / 2 + margin;
