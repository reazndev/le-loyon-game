import { CylinderGeometry, type BufferGeometry } from 'three';
import { pushOut, type Shape } from '../../engine/physics/collision';
import { playerTuning } from '../../engine/player';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { WALL, gapsByRoom, solidSpans, type Gap, type Opening, type Room, type Side } from './rooms';

/** Paint schemes for fort rooms. */
export type Finish =
  /** Pale green to shoulder height, white above, as in every Swiss army fort. */
  | 'army'
  /** Bare stone blocks under a barrel vault, as in bunker-tunnel.png. */
  | 'vault'
  /** Unpainted concrete. */
  | 'bare';

export interface RoomStyle {
  finish?: Finish;
  /** Sides with no wall, for walls a scene builds itself. */
  open?: Side[];
  /** Floor tint. Dust is pale, swept or wet floor darker. */
  floor?: number;
}

const PAINT_LINE = 1.45;
const GREEN = 0x7a876f;
const WHITE = 0xaeada2;

/** Floors, ceilings, and walls for a set of rooms, with every opening cut through. */
export function buildRooms(kit: LevelKit, rooms: readonly Room[], openings: readonly Opening[], styles: Record<string, RoomStyle> = {}): void {
  const gaps = gapsByRoom(rooms, openings);
  rooms.forEach((room) => {
    const style = styles[room.id] ?? {};
    const finish = style.finish ?? 'army';
    const w = room.x1 - room.x0;
    const d = room.z1 - room.z0;
    const cx = (room.x0 + room.x1) / 2;
    const cz = (room.z0 + room.z1) / 2;
    kit.plane({ w, d, cell: 0.6 }).texture('concrete_floor', { tile: 1.8 }).color(style.floor ?? 0x8a8780).at(cx, 0, cz);
    if (finish === 'vault') vault(kit, room);
    else kit.ceiling({ w, d, cell: 0.75 }).texture('concrete_bunker', { tile: 2 }).color(0x8a8a82).at(cx, room.h, cz);

    const roomGaps = gaps.get(room.id)!;
    (['n', 's', 'e', 'w'] as const)
      .filter((side) => !style.open?.includes(side))
      .forEach((side) => wallSide(kit, room, side, roomGaps.filter((g) => g.side === side), finish));
  });
}

/** One side of a room: solid spans, a lintel over each gap, and a floor across the wall's thickness. */
function wallSide(kit: LevelKit, room: Room, side: Side, gaps: Gap[], finish: Finish): void {
  const alongX = side === 'n' || side === 's';
  // North and south walls run past the corners so the corners are closed.
  const [start, end] = alongX ? [room.x0 - WALL, room.x1 + WALL] : [room.z0, room.z1];
  const offset = { n: room.z0 - WALL / 2, s: room.z1 + WALL / 2, w: room.x0 - WALL / 2, e: room.x1 + WALL / 2 }[side];
  const place = (from: number, to: number, y: number, h: number, texture: string, color: number, collide: boolean) => {
    const length = to - from;
    const mid = (from + to) / 2;
    const box = kit
      .box({ w: alongX ? length : WALL, h, d: alongX ? WALL : length, cell: 0.6 })
      .texture(texture, { tile: 1.6 })
      .color(color)
      .at(alongX ? mid : offset, y, alongX ? offset : mid);
    if (collide) box.collider();
  };
  const paint = (from: number, to: number, y: number, top: number) => {
    if (finish === 'vault') return place(from, to, y, top - y, 'tunnel_vault', 0x8e8a80, y === 0);
    if (finish === 'bare') return place(from, to, y, top - y, 'concrete_bunker', 0x8c8b84, y === 0);
    if (y < PAINT_LINE) place(from, to, y, Math.min(top, PAINT_LINE) - y, 'concrete_bunker', GREEN, y === 0);
    if (top > PAINT_LINE) place(from, to, Math.max(y, PAINT_LINE), top - Math.max(y, PAINT_LINE), 'concrete_bunker', WHITE, false);
  };
  const wallTop = finish === 'vault' ? VAULT_SPRING : room.h;
  solidSpans(start, end, gaps).forEach(([from, to]) => paint(from, to, 0, wallTop));
  gaps.forEach((gap) => {
    if (gap.h < wallTop) paint(gap.from, gap.to, gap.h, wallTop);
    const mid = (gap.from + gap.to) / 2;
    kit
      .plane({ w: alongX ? gap.to - gap.from : WALL, d: alongX ? WALL : gap.to - gap.from, cell: 0.6 })
      .texture('concrete_floor', { tile: 1.8 })
      .color(0x7e7b74)
      .at(alongX ? mid : offset, 0.002, alongX ? offset : mid);
  });
}

/** Height where a vaulted room's straight walls end and the arch begins. */
const VAULT_SPRING = 1.3;

/** A barrel vault along Z over the room, seen from inside. */
function vault(kit: LevelKit, room: Room): void {
  const r = (room.x1 - room.x0) / 2;
  const length = room.z1 - room.z0;
  const geometry = insideOut(new CylinderGeometry(r, r, length, 10, Math.ceil(length / 0.75), true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2));
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.PI * r, uv.getY(i) * length);
  kit.mesh(geometry).texture('tunnel_vault', { tile: 1.6 }).color(0x8e8a80).at((room.x0 + room.x1) / 2, VAULT_SPRING, (room.z0 + room.z1) / 2);
}

/** Turns a closed-outward surface inside out: flips the winding and the normals. */
export function insideOut(geometry: BufferGeometry): BufferGeometry {
  const index = geometry.getIndex()!;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i + 1);
    index.setX(i + 1, index.getX(i + 2));
    index.setX(i + 2, a);
  }
  const normal = geometry.getAttribute('normal');
  for (let i = 0; i < normal.count; i++) normal.setXYZ(i, -normal.getX(i), -normal.getY(i), -normal.getZ(i));
  return geometry;
}

/**
 * Pushes the player out of a shape while `shape()` returns one. Kit colliders are fixed once a
 * scene is built; this covers things that move while the player watches, such as a cupboard
 * on castors or a door that swings open. Returns the scene's per-frame update.
 */
export function movingBlocker(shape: () => Shape | null): (dt: number, ctx: SceneContext) => void {
  return (_dt, ctx) => {
    const current = shape();
    if (!current) return;
    const p = ctx.player.position;
    const push = pushOut(current, p.x, p.z, playerTuning.radius);
    if (push) p.set(p.x + push.x, p.y, p.z + push.z);
  };
}
