import { MathUtils } from 'three';

export interface Pose {
  x: number;
  z: number;
  /** Degrees, the player's convention: 0 looks down -Z, positive turns left. */
  yaw: number;
}

/** The pose `t` of the way from `from` to `to`, eased at both ends, turning the short way round. */
export function easePose(from: Pose, to: Pose, t: number): Pose {
  const e = MathUtils.smoothstep(t, 0, 1);
  const turn = MathUtils.euclideanModulo(to.yaw - from.yaw + 180, 360) - 180;
  return { x: MathUtils.lerp(from.x, to.x, e), z: MathUtils.lerp(from.z, to.z, e), yaw: from.yaw + turn * e };
}
