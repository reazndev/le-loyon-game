import type { Vec2 } from '../../engine/physics/collision';

/**
 * How far from a character the reporter stands to talk, in meters. At this distance the head
 * fills about a fifth of the frame's height, so the face reads as part of a person.
 */
export const TALK_DISTANCE = 1.3;

/** The move that takes `from` straight back from `to` until they are `distance` apart; none when already that far. */
export function stepBack(from: Vec2, to: Vec2, distance = TALK_DISTANCE): Vec2 {
  const dx = from.x - to.x;
  const dz = from.z - to.z;
  const gap = Math.hypot(dx, dz);
  if (gap >= distance || gap < 1e-3) return { x: 0, z: 0 };
  const scale = (distance - gap) / gap;
  return { x: dx * scale, z: dz * scale };
}
