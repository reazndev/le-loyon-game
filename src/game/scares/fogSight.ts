import { ps1Uniforms } from '../../engine/render/ps1Uniforms';

export interface Fog {
  near: number;
  far: number;
  density: number;
  wisps: number;
}

/** How much fog hides at this distance before it counts as gone. */
const HIDDEN = 0.95;

/**
 * Meters past which the fog hides a figure completely, by the same ramp and falloff as the PS1
 * material. Wisps thin the fog in patches, so the distance is pushed out a little for them.
 */
export function fogSight(fog: Fog): number {
  const ramp = fog.near + HIDDEN * (fog.far - fog.near);
  const falloff = fog.density > 0 ? fog.near + Math.sqrt(-Math.log(1 - HIDDEN)) / fog.density : Infinity;
  return Math.min(ramp, falloff) / (1 - fog.wisps / 4);
}

/** The fog the shared uniforms hold this frame, including any beat thickening or thinning it. */
export const liveFog = (): Fog => ({
  near: ps1Uniforms.uFogNear.value,
  far: ps1Uniforms.uFogFar.value,
  density: ps1Uniforms.uFogDensity.value,
  wisps: ps1Uniforms.uFogWisps.value,
});
