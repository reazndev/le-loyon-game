/**
 * Concrete rooms as rectangles in the XZ plane. Each room owns walls 0.3 m thick outside its
 * edges, so two rooms that share a wall sit exactly 0.6 m apart. Openings are declared once,
 * between two rooms, and cut through both walls.
 */

export const WALL = 0.3;

export type Side = 'n' | 's' | 'e' | 'w';

export interface Room {
  id: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  /** Ceiling height. */
  h: number;
}

export interface Opening {
  a: string;
  b: string;
  /** Center of the opening along the shared wall: z for east and west walls, x for north and south. */
  at: number;
  w: number;
  /** Height of the opening. Default 2. */
  h?: number;
}

/** A gap in one room's wall. */
export interface Gap {
  side: Side;
  from: number;
  to: number;
  h: number;
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

/** Which wall of `a` faces `b`, or null when they don't share one. North is -Z. */
export function sharedSide(a: Room, b: Room): Side | null {
  if (near(a.x1 + 2 * WALL, b.x0)) return 'e';
  if (near(b.x1 + 2 * WALL, a.x0)) return 'w';
  if (near(a.z1 + 2 * WALL, b.z0)) return 's';
  if (near(b.z1 + 2 * WALL, a.z0)) return 'n';
  return null;
}

export const opposite: Record<Side, Side> = { n: 's', s: 'n', e: 'w', w: 'e' };

/** The gaps every opening cuts into each room's walls. Throws on rooms that don't touch. */
export function gapsByRoom(rooms: readonly Room[], openings: readonly Opening[]): Map<string, Gap[]> {
  const byId = new Map(rooms.map((room) => [room.id, room]));
  const gaps = new Map<string, Gap[]>(rooms.map((room) => [room.id, []]));
  openings.forEach((opening) => {
    const a = byId.get(opening.a);
    const b = byId.get(opening.b);
    const side = a && b ? sharedSide(a, b) : null;
    if (!side) throw new Error(`Rooms ${opening.a} and ${opening.b} do not share a wall`);
    const gap = { from: opening.at - opening.w / 2, to: opening.at + opening.w / 2, h: opening.h ?? 2 };
    gaps.get(opening.a)!.push({ side, ...gap });
    gaps.get(opening.b)!.push({ side: opposite[side], ...gap });
  });
  return gaps;
}

/** The solid stretches of a wall from `start` to `end` once the gaps are cut out, in order. */
export function solidSpans(start: number, end: number, gaps: readonly { from: number; to: number }[]): [number, number][] {
  const sorted = [...gaps].sort((p, q) => p.from - q.from);
  const spans: [number, number][] = [];
  let cursor = start;
  sorted.forEach((gap) => {
    if (gap.from > cursor) spans.push([cursor, gap.from]);
    cursor = Math.max(cursor, gap.to);
  });
  if (end > cursor) spans.push([cursor, end]);
  return spans;
}

/** The room containing (x, z), or null when the point is in a wall or doorway. */
export const roomAt = (rooms: readonly Room[], x: number, z: number): Room | null =>
  rooms.find((room) => x >= room.x0 && x <= room.x1 && z >= room.z0 && z <= room.z1) ?? null;

/** Rooms one opening away from `id`. */
export const neighbors = (openings: readonly Opening[], id: string): string[] =>
  openings.flatMap((o) => (o.a === id ? [o.b] : o.b === id ? [o.a] : []));
