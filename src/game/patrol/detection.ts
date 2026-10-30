import type { Vec2 } from '../../engine/physics/collision';
import { headingOf, angleDelta } from '../../engine/characters/motion';

/** The watchman's torch from docs/script/04-cemetery.md: a cone 12 m long and 25 degrees wide. */
export interface Torch extends Vec2 {
  /** Radians, the level's yaw convention. */
  yaw: number;
  range: number;
  /** Half the cone's width, in radians. */
  halfAngle: number;
}

export const TORCH_RANGE = 12;
export const TORCH_HALF_ANGLE = (12.5 * Math.PI) / 180;
/** The player's own flashlight gives them away within this distance of the watchman. */
export const FLASHLIGHT_RANGE = 30;
/** Close enough that crouching doesn't help once he is looking your way. */
export const POINT_BLANK = 4;

export function inTorchCone(torch: Torch, point: Vec2): boolean {
  const dx = point.x - torch.x;
  const dz = point.z - torch.z;
  const distance = Math.hypot(dx, dz);
  if (distance > torch.range) return false;
  if (distance < 0.5) return true;
  return Math.abs(angleDelta(torch.yaw, headingOf(dx, dz))) <= torch.halfAngle;
}

/** Shortest distance from a point to a polyline. */
export function distanceToPath(path: readonly Vec2[], point: Vec2): number {
  if (path.length === 1) return Math.hypot(point.x - path[0]!.x, point.z - path[0]!.z);
  return path.slice(1).reduce((best, b, i) => {
    const a = path[i]!;
    const ex = b.x - a.x;
    const ez = b.z - a.z;
    const length2 = ex * ex + ez * ez || 1;
    const k = Math.max(0, Math.min(1, ((point.x - a.x) * ex + (point.z - a.z) * ez) / length2));
    return Math.min(best, Math.hypot(point.x - (a.x + ex * k), point.z - (a.z + ez * k)));
  }, Infinity);
}

/** Why the watchman knows someone is there. */
export type Cause = 'flashlight' | 'beam' | 'evidence';

export interface SightInput {
  torch: Torch;
  watchman: Vec2;
  player: Vec2 & { crouched: boolean; flashlight: boolean };
  /** The player is inside the grounds he guards, such as the cemetery. */
  inGrounds: boolean;
  /** The player is in a hiding spot such as the ossuary shed. */
  hidden: boolean;
  /** Nothing solid stands between the torch and the player. Only asked when it matters. */
  clearSight: () => boolean;
  /** Things he must not find, such as an open grave, that are there right now. */
  evidence: readonly Vec2[];
  /** He has turned his torch toward a noise or a growl. */
  investigating: boolean;
}

/**
 * Decides whether the watchman notices the player this frame, following the rules in
 * docs/script/04-cemetery.md. Standing in the beam is enough; crouched, the player is safe
 * when something solid is in between, unless he is searching at point-blank range.
 */
export function noticed(input: SightInput): Cause | null {
  const { torch, watchman, player } = input;
  const distance = Math.hypot(player.x - watchman.x, player.z - watchman.z);
  if (input.inGrounds && input.evidence.some((spot) => inTorchCone(torch, spot))) return 'evidence';
  if (input.hidden) return null;
  if (input.inGrounds && player.flashlight && distance <= FLASHLIGHT_RANGE) return 'flashlight';
  if (!inTorchCone(torch, player)) return null;
  if (!player.crouched) return 'beam';
  if (input.investigating && distance < POINT_BLANK) return 'beam';
  return input.clearSight() ? 'beam' : null;
}
