import type { Point3 } from '../../engine/audio/audioManager';
import { waterDrop } from '../../game/ambient/sounds';
import type { SceneContext } from '../../game/scene';
import { neighbors, roomAt, type Opening, type Room } from './rooms';

/** One drop of water falling into a puddle on concrete. Kept for bunker_hidden, which imports it from here. */
export const drip = waterDrop;

/**
 * bun2_drip: water drips somewhere in the fort, always in a room next to the one the player
 * is in, wherever they go. Returns the scene's per-frame update.
 */
export function dripInTheNextRoom(rooms: readonly Room[], openings: readonly Opening[], interval = 4.5): (dt: number, ctx: SceneContext) => void {
  let wait = interval;
  let current: Room | null = null;
  let source: Point3 | null = null;
  return (dt, ctx) => {
    current = roomAt(rooms, ctx.player.position.x, ctx.player.position.z) ?? current;
    wait -= dt;
    if (wait > 0 || !current) return;
    wait = interval * (0.6 + Math.random() * 0.9);
    const next = rooms.filter((room) => neighbors(openings, current!.id).includes(room.id));
    if (!next.length) return;
    // The same leak keeps dripping until the player moves on, then it is in the next room again.
    if (!source || roomAt(rooms, source.x, source.z) === current || !next.includes(roomAt(rooms, source.x, source.z)!)) {
      const room = next[Math.floor(Math.random() * next.length)]!;
      source = { x: room.x0 + Math.random() * (room.x1 - room.x0), y: 0.1, z: room.z0 + Math.random() * (room.z1 - room.z0) };
    }
    waterDrop(ctx.audio, source, 0.5);
  };
}
