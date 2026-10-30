import { Color, Vector2, Vector3 } from 'three';

export const MAX_POINT_LIGHTS = 8;

/**
 * Uniforms shared by every PS1 material. Materials hold references to these objects, so the
 * lighting rig and atmosphere update one place and every mesh follows.
 */
export const ps1Uniforms = {
  uTime: { value: 0 },
  uSnap: { value: new Vector2(320, 240) },
  uFogColor: { value: new Color(0.5, 0.5, 0.5) },
  uFogNear: { value: 1 },
  uFogFar: { value: 12 },
  uFogDensity: { value: 0 },
  uFogWisps: { value: 0 },
  uAmbient: { value: new Color(0.3, 0.3, 0.3) },
  uSunDir: { value: new Vector3(0, 1, 0) },
  uSunColor: { value: new Color(0, 0, 0) },
  uPointPos: { value: Array.from({ length: MAX_POINT_LIGHTS }, () => new Vector3()) },
  uPointColor: { value: Array.from({ length: MAX_POINT_LIGHTS }, () => new Color(0, 0, 0)) },
  uPointRange: { value: new Array<number>(MAX_POINT_LIGHTS).fill(1) },
  uPointCount: { value: 0 },
  uSpotPos: { value: new Vector3() },
  uSpotDir: { value: new Vector3(0, 0, -1) },
  uSpotColor: { value: new Color(0, 0, 0) },
  uSpotRange: { value: 10 },
  uSpotCos: { value: new Vector2(0.9, 0.97) },
  uSpotFogGlow: { value: 0.36 },
  uLightFogGlow: { value: 0.22 },
};
